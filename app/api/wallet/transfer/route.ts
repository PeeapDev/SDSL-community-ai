import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminSupabase } from "@/lib/supabaseServer"

// TODO: replace stubs with real Supabase double-entry logic
const TransferBody = z.object({
  toUserId: z.string().min(1),
  amount: z.number().positive(),
  note: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const fromUserId = req.headers.get("x-user-id") || null
    if (!fromUserId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

    const json = await req.json().catch(() => null)
    const parsed = TransferBody.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const { toUserId, amount, note } = parsed.data
    if (toUserId === fromUserId) return NextResponse.json({ error: "Cannot transfer to self" }, { status: 400 })

    const supabase = getAdminSupabase()
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
