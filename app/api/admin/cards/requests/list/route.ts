import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  const role = (req.headers.get("x-user-role") || "").toLowerCase()
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const supabase = getAdminSupabase()
    const url = new URL(req.url)
    const status = url.searchParams.get("status") || "pending"
    const { data, error } = await supabase
      .from("nfc_card_requests")
      .select("id, user_id, role, status, requested_at, approved_at, approved_by, card_uid, nfc_link")
      .eq("status", status)
      .order("requested_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ ok: true, requests: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
