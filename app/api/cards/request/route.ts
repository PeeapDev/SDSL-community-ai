import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id") || null
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
    const json = await req.json().catch(() => ({})) as any
    const role = typeof json.role === 'string' ? json.role : null

    const supabase = getAdminSupabase()

    // Upsert a pending request if not already pending
    const { data: existing, error: eErr } = await supabase
      .from("nfc_card_requests")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "pending")
      .limit(1)
    if (eErr) throw eErr

    if (existing && existing.length > 0) {
      return NextResponse.json({ ok: true, requestId: existing[0].id, status: existing[0].status })
    }

    const { data, error } = await supabase
      .from("nfc_card_requests")
      .insert({ user_id: userId, role })
      .select("id, status")
      .limit(1)
    if (error) throw error

    return NextResponse.json({ ok: true, requestId: data?.[0]?.id, status: data?.[0]?.status })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
