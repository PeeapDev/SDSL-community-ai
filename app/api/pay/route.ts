import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAdminSupabase } from "@/lib/supabaseServer"
import { verifyPin } from "@/lib/security"

const PayBody = z.object({
  from: z.string(), // user_id | @handle | +phone | qr:SECRET | card:UID
  to: z.string(),   // same formats as from (except card allowed for receiver as well)
  amount: z.number().positive(),
  pin: z.string().min(4).max(8),
  note: z.string().optional(),
})

async function resolveUserId(supabase: ReturnType<typeof getAdminSupabase>, id: string): Promise<string | null> {
  const norm = String(id || '').trim()
  if (!norm) return null
  // QR secret
  if (norm.startsWith("qr:")) {
    const secret = norm.slice(3).toLowerCase()
    const { data, error } = await supabase.from("user_directory").select("user_id").eq("qr_secret", secret).limit(1)
    if (error) throw error
    return data && data[0]?.user_id || null
  }
  // NFC card
  if (norm.startsWith("card:")) {
    const uid = norm.slice(5)
    const { data, error } = await supabase.from("nfc_cards").select("user_id, active").eq("card_uid", uid).limit(1)
    if (error) throw error
    if (!data || !data[0] || data[0].active !== true) return null
    return data[0].user_id
  }
  const lower = norm.toLowerCase()
  let q = supabase.from("user_directory").select("user_id, handle, phone").limit(1)
  if (lower.startsWith("@")) q = q.eq("handle", lower.slice(1))
  else if (lower.startsWith("+")) q = q.eq("phone", lower)
  else q = q.eq("user_id", lower)
  const { data, error } = await q
  if (error) throw error
  return data && data[0]?.user_id || null
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = PayBody.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const { from, to, amount, pin, note } = parsed.data
    const supabase = getAdminSupabase()

    const fromUserId = await resolveUserId(supabase, from)
    const toUserId = await resolveUserId(supabase, to)
    if (!fromUserId || !toUserId) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (fromUserId === toUserId) return NextResponse.json({ error: "Cannot pay self" }, { status: 400 })

    // Verify PIN of sender
    const { data: rows, error: pErr } = await supabase.from("user_directory").select("pin_hash").eq("user_id", fromUserId).limit(1)
    if (pErr) return NextResponse.json({ error: pErr.message }, { status: 400 })
    const pinHash = rows?.[0]?.pin_hash as string | null | undefined
    const ok = await verifyPin(pin, pinHash)
    if (!ok) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 })

    const cents = Math.round(amount * 100)
    const idem = req.headers.get("x-idempotency-key") || crypto.randomUUID()

    const { data, error } = await supabase.rpc("wallet_transfer", {
      p_from: fromUserId,
      p_to: toUserId,
      p_amount_cents: cents,
      p_note: note ?? null,
      p_correlation: idem,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true, transfer: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
