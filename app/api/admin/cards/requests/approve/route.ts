import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function POST(req: NextRequest) {
  const role = (req.headers.get("x-user-role") || "").toLowerCase()
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const json = await req.json().catch(() => null)
    const { requestId, cardUid, approvedBy } = (json || {}) as { requestId?: string; cardUid?: string; approvedBy?: string }
    if (!requestId || !cardUid) return NextResponse.json({ error: "requestId and cardUid required" }, { status: 400 })

    const supabase = getAdminSupabase()

    // Load request
    const { data: reqs, error: rErr } = await supabase
      .from("nfc_card_requests")
      .select("id, user_id, status")
      .eq("id", requestId)
      .limit(1)
    if (rErr) throw rErr
    const reqRow = reqs?.[0]
    if (!reqRow) return NextResponse.json({ error: "Request not found" }, { status: 404 })
    if (reqRow.status !== "pending") return NextResponse.json({ error: "Request not pending" }, { status: 400 })

    const userId = reqRow.user_id as string

    // Upsert card and generate link
    const nfcLink = `card:${cardUid}`
    const { error: cErr } = await supabase
      .from("nfc_cards")
      .upsert({ card_uid: String(cardUid), user_id: userId, active: true }, { onConflict: "card_uid" })
    if (cErr) throw cErr

    const { error: uErr } = await supabase
      .from("nfc_card_requests")
      .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: approvedBy || "admin", card_uid: String(cardUid), nfc_link: nfcLink })
      .eq("id", requestId)
    if (uErr) throw uErr

    return NextResponse.json({ ok: true, userId, cardUid, nfcLink })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
