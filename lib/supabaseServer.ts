import { createClient } from "@supabase/supabase-js"

// Server-side Supabase client using service role for wallet mutations.
// NEVER expose SERVICE_ROLE in the browser.
export function getAdminSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, key, { auth: { persistSession: false } })
}
