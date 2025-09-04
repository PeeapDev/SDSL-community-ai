import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

function normHandle(input?: string | null) {
  if (!input) return null
  const h = input.trim().replace(/^@+/, "").toLowerCase()
  if (!h) return null
  if (!/^[a-z0-9_]{3,30}$/.test(h)) throw new Error("Handle must be 3-30 chars: lowercase letters, numbers, underscore")
  return h
}

function normPhone(input?: string | null) {
  if (!input) return null
  const raw = input.trim()
  if (!raw) return null
  const digits = raw.replace(/[^0-9+]/g, "")
  if (!/^\+?[0-9]{7,15}$/.test(digits)) throw new Error("Phone must be 7-15 digits, optionally starting with +")
  return digits.startsWith("+") ? digits : "+" + digits
}

export async function GET(req: NextRequest) {
  const supabase = getAdminSupabase()
  const userId = req.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Missing x-user-id" }, { status: 400 })
  const { data, error } = await supabase
    .from("user_directory")
    .select("user_id, handle, phone, display_name")
    .eq("user_id", userId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user: data || { user_id: userId } })
}

export async function POST(req: NextRequest) {
  const supabase = getAdminSupabase()
  const userId = req.headers.get("x-user-id")
  if (!userId) return NextResponse.json({ error: "Missing x-user-id" }, { status: 400 })

  try {
    const body = await req.json().catch(() => ({})) as { handle?: string; phone?: string; displayName?: string }
    const handle = normHandle(body.handle)
    const phone = normPhone(body.phone)
    const display_name = (body.displayName || "").trim() || null

    // Enforce uniqueness manually to give nicer errors
    if (handle) {
      const { data: h } = await supabase.from("user_directory").select("user_id").eq("handle", handle).maybeSingle()
      if (h && h.user_id !== userId) return NextResponse.json({ error: "Handle already taken" }, { status: 409 })
    }
    if (phone) {
      const { data: p } = await supabase.from("user_directory").select("user_id").eq("phone", phone).maybeSingle()
      if (p && p.user_id !== userId) return NextResponse.json({ error: "Phone already in use" }, { status: 409 })
    }

    const { data, error } = await supabase
      .from("user_directory")
      .upsert({ user_id: userId, handle, phone, display_name }, { onConflict: "user_id" })
      .select("user_id, handle, phone, display_name")
      .maybeSingle()

    if (error) throw error
    return NextResponse.json({ user: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 400 })
  }
}
