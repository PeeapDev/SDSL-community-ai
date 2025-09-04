"use client"

import { createClient } from "@supabase/supabase-js"

// Read from NEXT_PUBLIC_* so it works on client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Non-fatal: allow build but warn in console
  console.warn("Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local")
}

export const supabase = createClient(SUPABASE_URL ?? "", SUPABASE_ANON_KEY ?? "")

export type Session = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]
