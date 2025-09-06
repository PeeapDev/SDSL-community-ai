import { NextRequest, NextResponse } from "next/server"
import QRCode from "qrcode"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const identifier = (url.searchParams.get("identifier") || url.searchParams.get("userId") || "").trim()
    if (!identifier) return NextResponse.json({ error: "Missing identifier" }, { status: 400 })

    const supabase = getAdminSupabase()

    // Resolve user by identifier
    let q = supabase.from("user_directory").select("user_id, qr_secret").limit(1)
    const lower = identifier.toLowerCase()
    if (lower.startsWith("@")) q = q.eq("handle", lower.slice(1))
    else if (lower.startsWith("+")) q = q.eq("phone", lower)
    else q = q.eq("user_id", lower)
    const { data: rows, error: rErr } = await q
    if (rErr) throw rErr
    if (!rows || rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const { user_id, qr_secret } = rows[0] as { user_id: string; qr_secret: string | null }

    // Ensure qr_secret exists
    let secret = qr_secret
    if (!secret) {
      secret = Math.random().toString(36).slice(2, 12)
      const { error: uErr } = await supabase.from("user_directory").update({ qr_secret: secret }).eq("user_id", user_id)
      if (uErr) throw uErr
    }

    const payload = `qr:${secret}`
    const dataUrl = await QRCode.toDataURL(payload, { errorCorrectionLevel: "M", width: 256 })

    return NextResponse.json({ ok: true, userId: user_id, payload, dataUrl })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to generate QR" }, { status: 500 })
  }
}
