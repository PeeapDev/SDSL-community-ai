-- Internal wallet schema and RPC for atomic transfers
-- Run this in Supabase SQL Editor

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

create policy if not exists "read_own_wallet" on wallets
  for select using (auth.uid()::text = user_id);

create policy if not exists "read_own_ledger" on ledger_entries
  for select using (auth.uid()::text = user_id);

create policy if not exists "read_related_transfers" on transfers
  for select using (auth.uid()::text in (from_user_id, to_user_id));

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

create index if not exists idx_user_directory_handle on user_directory(lower(handle));
create index if not exists idx_user_directory_phone on user_directory(phone);

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
