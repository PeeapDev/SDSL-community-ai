import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function POST(req: NextRequest) {
  const role = (req.headers.get("x-user-role") || "").toLowerCase()
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }
  const { userId, identifier } = body || {}

  const supabase = getAdminSupabase()
  try {
    let targetUserId: string | null = userId || null
    if (!targetUserId) {
      const norm = String(identifier || '').trim().toLowerCase()
      let q = supabase.from("user_directory").select("user_id, handle, phone").limit(1)
      if (norm.startsWith("@")) q = q.eq("handle", norm.slice(1))
      else if (norm.startsWith("+")) q = q.eq("phone", norm)
      else q = q.eq("user_id", norm)
      const { data: rows, error: rErr } = await q
      if (rErr) throw rErr
      if (!rows || rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 })
      targetUserId = rows[0].user_id
    }

    const { data, error } = await supabase.from("nfc_cards").select("card_uid, active, issued_at, revoked_at").eq("user_id", targetUserId)
    if (error) throw error

    return NextResponse.json({ ok: true, userId: targetUserId, cards: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "List failed" }, { status: 500 })
  }
}
