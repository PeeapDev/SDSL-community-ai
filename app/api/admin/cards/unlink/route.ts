import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function POST(req: NextRequest) {
  const role = (req.headers.get("x-user-role") || "").toLowerCase()
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }
  const { cardUid } = body || {}
  if (!cardUid) return NextResponse.json({ error: "cardUid required" }, { status: 400 })

  const supabase = getAdminSupabase()
  try {
    const { error: upErr } = await supabase
      .from("nfc_cards")
      .update({ active: false, revoked_at: new Date().toISOString() })
      .eq("card_uid", String(cardUid))
    if (upErr) throw upErr

    return NextResponse.json({ ok: true, cardUid })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unlink failed" }, { status: 500 })
  }
}
