-- Internal wallet schema and RPC for atomic transfers
-- Run this in Supabase SQL Editor

-- Ensure pgcrypto is available for gen_random_uuid()
create extension if not exists pgcrypto;

create table if not exists wallets (
  user_id text primary key,
  available_cents bigint not null default 0,
  pending_cents bigint not null default 0,
  currency text not null default 'USD',
  is_frozen boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  amount_cents bigint not null,
  currency text not null default 'USD',
  direction text not null check (direction in ('debit','credit')),
  kind text not null check (kind in ('topup','purchase','refund','transfer','fee','payout','hold','capture','release')),
  reference_id text,
  correlation_id text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_ledger_user_created on ledger_entries(user_id, created_at desc);
create index if not exists idx_ledger_correlation on ledger_entries(correlation_id);

create table if not exists transfers (
  id uuid primary key default gen_random_uuid(),
  from_user_id text not null,
  to_user_id text not null,
  amount_cents bigint not null,
  status text not null default 'succeeded',
  correlation_id text,
  note text,
  created_at timestamptz not null default now()
);

-- Ensure wallet row exists helper
create or replace function ensure_wallet(p_user text)
returns void language plpgsql as $$
begin
  insert into wallets(user_id)
  values (p_user)
  on conflict (user_id) do nothing;
end;$$;

-- Atomic wallet transfer RPC
create or replace function wallet_transfer(
  p_from text,
  p_to text,
  p_amount_cents bigint,
  p_note text default null,
  p_correlation text default null
) returns jsonb language plpgsql security definer as $$
declare
  from_balance bigint;
  l_per_tx_limit bigint;
  l_from_frozen boolean;
  l_to_frozen boolean;
  res jsonb;
begin
  if p_amount_cents <= 0 then
    raise exception 'Amount must be positive';
  end if;
  if p_from = p_to then
    raise exception 'Cannot transfer to self';
  end if;

  perform ensure_wallet(p_from);
  perform ensure_wallet(p_to);

  perform pg_advisory_xact_lock(hashtext(p_from));
  perform pg_advisory_xact_lock(hashtext(p_to));

  select available_cents, is_frozen into from_balance, l_from_frozen from wallets where user_id = p_from for update;
  select is_frozen into l_to_frozen from wallets where user_id = p_to for update;

  if coalesce(l_from_frozen, false) then
    raise exception 'Sender wallet is frozen';
  end if;
  if coalesce(l_to_frozen, false) then
    raise exception 'Recipient wallet is frozen';
  end if;

  -- Per-role per-transaction limit (optional, if role found)
  select rl.per_tx_limit_cents into l_per_tx_limit
  from user_roles ur
  join role_limits rl on rl.role = ur.role
  where ur.user_id = p_from
  limit 1;
  if l_per_tx_limit is not null and p_amount_cents > l_per_tx_limit then
    raise exception 'Amount exceeds per-transaction limit';
  end if;

  if from_balance is null then from_balance := 0; end if;
  if from_balance < p_amount_cents then
    raise exception 'Insufficient balance';
  end if;

  update wallets set available_cents = available_cents - p_amount_cents where user_id = p_from;
  update wallets set available_cents = available_cents + p_amount_cents where user_id = p_to;

  insert into ledger_entries(user_id, amount_cents, direction, kind, reference_id, correlation_id, note)
  values (p_from, p_amount_cents, 'debit', 'transfer', null, p_correlation, p_note),
         (p_to,   p_amount_cents, 'credit','transfer', null, p_correlation, p_note);

  insert into transfers(from_user_id, to_user_id, amount_cents, status, correlation_id, note)
  values (p_from, p_to, p_amount_cents, 'succeeded', p_correlation, p_note)
  returning jsonb_build_object('id', id, 'from', from_user_id, 'to', to_user_id, 'amount_cents', amount_cents, 'status', status, 'created_at', created_at) into res;

  return res;
end;$$;

-- Expose RPC via PostgREST
-- In Supabase, rpc functions are accessible under /rest/v1/rpc/<name>

-- RLS (reads only). Writes will use service role via server.
alter table wallets enable row level security;
alter table ledger_entries enable row level security;
alter table transfers enable row level security;

drop policy if exists "read_own_wallet" on wallets;
create policy "read_own_wallet" on wallets
  for select
  using (auth.uid()::text = user_id);

drop policy if exists "read_own_ledger" on ledger_entries;
create policy "read_own_ledger" on ledger_entries
  for select
  using (auth.uid()::text = user_id);

drop policy if exists "read_related_transfers" on transfers;
create policy "read_related_transfers" on transfers
  for select
  using (auth.uid()::text in (from_user_id, to_user_id));

-- Role mapping and limits for admin control
create table if not exists user_roles (
  user_id text primary key,
  role text not null check (role in ('student','teacher','vendor','admin')),
  updated_at timestamptz not null default now()
);

create table if not exists role_limits (
  role text primary key,
  per_tx_limit_cents bigint,
  daily_outflow_limit_cents bigint,
  updated_at timestamptz not null default now()
);

-- Admin adjustment (mint/burn) with audit via ledger
-- Positive amount_cents credits user; negative debits user.
create or replace function wallet_admin_adjust(
  p_user text,
  p_amount_cents bigint,
  p_note text default null,
  p_correlation text default null
) returns jsonb language plpgsql security definer as $$
declare
  res jsonb;
begin
  perform ensure_wallet(p_user);
  perform pg_advisory_xact_lock(hashtext(p_user));

  if p_amount_cents = 0 then
    raise exception 'Amount cannot be zero';
  end if;

  if p_amount_cents > 0 then
    update wallets set available_cents = available_cents + p_amount_cents where user_id = p_user;
    insert into ledger_entries(user_id, amount_cents, direction, kind, reference_id, correlation_id, note)
    values (p_user, p_amount_cents, 'credit', 'admin_adjust', null, p_correlation, p_note);
  else
    -- Ensure sufficient funds for debit
    if (select available_cents from wallets where user_id = p_user for update) < abs(p_amount_cents) then
      raise exception 'Insufficient balance for admin debit';
    end if;
    update wallets set available_cents = available_cents + p_amount_cents where user_id = p_user; -- p_amount_cents is negative
    insert into ledger_entries(user_id, amount_cents, direction, kind, reference_id, correlation_id, note)
    values (p_user, abs(p_amount_cents), 'debit', 'admin_adjust', null, p_correlation, p_note);
  end if;

  select jsonb_build_object('user_id', p_user, 'delta_cents', p_amount_cents) into res;
  return res;
end;$$;

-- Freeze/unfreeze helpers
create or replace function wallet_set_frozen(p_user text, p_frozen boolean)
returns void language plpgsql security definer as $$
begin
  perform ensure_wallet(p_user);
  update wallets set is_frozen = coalesce(p_frozen, false) where user_id = p_user;
end;$$;

-- Directory for usernames and phone numbers
create table if not exists user_directory (
  user_id text primary key,
  handle text unique,          -- '@username' without the '@', lowercase
  phone text unique,           -- normalized E.164 string, e.g. '+15551234567'
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_directory_handle on public.user_directory(lower(handle));
create index if not exists idx_user_directory_phone on public.user_directory(phone);

-- Optional: trigger to maintain updated_at
create or replace function touch_user_directory()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;$$;

drop trigger if exists trg_touch_user_directory on user_directory;
create trigger trg_touch_user_directory before update on user_directory
for each row execute function touch_user_directory();

-- =====================================================================
-- Chrome Extension Integration (registry, installs, permissions, intents)
-- =====================================================================

-- Registry of extension clients that integrate with this backend
create table if not exists extension_clients (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,               -- e.g. "sdsl-pay"
  name text not null,
  created_at timestamptz not null default now()
);

-- Per-user extension installations
create table if not exists extension_installations (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  extension_code text not null references extension_clients(code) on delete cascade,
  installed_at timestamptz not null default now(),
  unique(user_id, extension_code)
);
create index if not exists idx_ext_installs_user on extension_installations(user_id);
create index if not exists idx_ext_installs_code on extension_installations(extension_code);

-- Site permissions granted by the user to the extension
create table if not exists site_permissions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  origin text not null,                   -- e.g. "https://example.com"
  permission text not null check (permission in ('dom_read','dom_write','payments')),
  granted boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(user_id, origin, permission)
);
create index if not exists idx_site_perms_user on site_permissions(user_id);
create index if not exists idx_site_perms_origin on site_permissions(origin);

-- Payment intents initiated from extension (or web) before final wallet transfer
create table if not exists payment_intents (
  id uuid primary key default gen_random_uuid(),
  from_user_id text not null,              -- payer
  to_user_id text not null,                -- payee (resolved from handle/phone)
  amount_cents bigint not null,
  currency text not null default 'USD',
  status text not null check (status in ('requires_confirmation','processing','succeeded','canceled','failed')) default 'requires_confirmation',
  origin text,                             -- site origin that initiated the intent
  extension_code text references extension_clients(code) on delete set null,
  correlation_id text,                     -- for idempotency
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payment_intents_from on payment_intents(from_user_id, created_at desc);
create index if not exists idx_payment_intents_to on payment_intents(to_user_id, created_at desc);
create index if not exists idx_payment_intents_status on payment_intents(status);

-- Optional: trigger to maintain updated_at
create or replace function touch_payment_intents()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;$$;

drop trigger if exists trg_touch_payment_intents on payment_intents;
create trigger trg_touch_payment_intents before update on payment_intents
for each row execute function touch_payment_intents();

-- Event log for intents and extension actions
create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  intent_id uuid references payment_intents(id) on delete cascade,
  type text not null,                      -- e.g. 'created','confirmed','succeeded','failed'
  data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_payment_events_intent on payment_events(intent_id, created_at desc);

-- Optional DOM access audit
create table if not exists dom_access_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  origin text,
  action text not null,                    -- e.g. 'read','write'
  details jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_dom_logs_user on dom_access_logs(user_id, created_at desc);
create index if not exists idx_dom_logs_origin on dom_access_logs(origin, created_at desc);

-- Enable RLS for read safety (writes via service role)
alter table extension_clients enable row level security;
alter table extension_installations enable row level security;
alter table site_permissions enable row level security;
alter table payment_intents enable row level security;
alter table payment_events enable row level security;
alter table dom_access_logs enable row level security;

-- Read policies
drop policy if exists "read_own_installs" on extension_installations;
create policy "read_own_installs" on extension_installations for select using (auth.uid()::text = user_id);

drop policy if exists "read_own_site_perms" on site_permissions;
create policy "read_own_site_perms" on site_permissions for select using (auth.uid()::text = user_id);

drop policy if exists "read_own_payment_intents" on payment_intents;
create policy "read_own_payment_intents" on payment_intents for select using (auth.uid()::text in (from_user_id, to_user_id));

drop policy if exists "read_own_payment_events" on payment_events;
create policy "read_own_payment_events" on payment_events for select using (exists (
  select 1 from payment_intents pi where pi.id = intent_id and auth.uid()::text in (pi.from_user_id, pi.to_user_id)
));

drop policy if exists "read_own_dom_logs" on dom_access_logs;
create policy "read_own_dom_logs" on dom_access_logs for select using (auth.uid()::text = user_id);

-- =====================================================================
-- Admin additions: optional user directory fields
-- =====================================================================
alter table user_directory
  add column if not exists gender text check (gender in ('male','female','other'));

alter table user_directory
  add column if not exists blocked boolean not null default false;

-- Optional: inline role on user_directory for convenience/admin UI
alter table user_directory
  add column if not exists role text check (role in ('student','teacher','vendor','admin'));

-- Optional one-time backfill from user_roles if present
update user_directory ud
set role = ur.role
from user_roles ur
where ur.user_id = ud.user_id and (ud.role is null or ud.role <> ur.role);

-- =====================================================================
-- Extended user profile fields (common across roles; school_name optional for vendor)
-- =====================================================================
alter table user_directory
  add column if not exists first_name text;

alter table user_directory
  add column if not exists last_name text;

alter table user_directory
  add column if not exists school_name text; -- students/teachers primarily

alter table user_directory
  add column if not exists country text;

alter table user_directory
  add column if not exists account_number text;
create index if not exists idx_user_directory_account on user_directory(account_number);

alter table user_directory
  add column if not exists dob date;

alter table user_directory
  add column if not exists profile_image_url text;

-- Email is primarily managed by Supabase auth, but optionally cached here for admin UI
alter table user_directory
  add column if not exists email text;
create index if not exists idx_user_directory_email on user_directory(lower(email));

-- Transaction PIN storage (store only hashed values; never plaintext)
alter table user_directory
  add column if not exists pin_hash text; -- format: v1$<salt_b64>$<hash_b64>

-- Optional QR secret (if we decide to encode a secret instead of user_id directly)
alter table user_directory
  add column if not exists qr_secret text;
create index if not exists idx_user_directory_qr on user_directory(qr_secret);

-- =====================================================================
-- Closed-loop NFC card registry for tap-to-pay
-- =====================================================================
create table if not exists nfc_cards (
  card_uid text primary key,            -- unique NFC UID or tokenized ID
  user_id text references user_directory(user_id) on delete set null,
  active boolean not null default true,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists idx_nfc_cards_user on nfc_cards(user_id);

-- =====================================================================
-- NFC card request workflow (users request cards; admin approves & issues)
-- =====================================================================
create table if not exists nfc_card_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references user_directory(user_id) on delete cascade,
  role text check (role in ('student','teacher','vendor','admin')),
  status text not null check (status in ('pending','approved','rejected')) default 'pending',
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by text, -- admin user_id or email reference
  card_uid text,    -- filled when approved and issued
  nfc_link text     -- generated link text to embed on physical NFC card
);
create index if not exists idx_nfc_card_req_user on nfc_card_requests(user_id, requested_at desc);
