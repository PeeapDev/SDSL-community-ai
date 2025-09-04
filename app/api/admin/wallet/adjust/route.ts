import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminSupabase } from "@/lib/supabaseServer"

const Body = z.object({
  userId: z.string().min(1),
  amount: z.number(), // positive to credit, negative to debit
  note: z.string().optional(),
})

function isAdmin(req: Request) {
  // Temporary admin gate: require x-user-role=admin until real auth
  return (req.headers.get("x-user-role") || "").toLowerCase() === "admin"
}

export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const json = await req.json().catch(() => null)
    const parsed = Body.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const { userId, amount, note } = parsed.data
    const cents = Math.round(amount * 100)
    const idem = req.headers.get("x-idempotency-key") || crypto.randomUUID()

    const supabase = getAdminSupabase()
    const { data, error } = await supabase.rpc("wallet_admin_adjust", {
      p_user: userId,
      p_amount_cents: cents,
      p_note: note ?? null,
      p_correlation: idem,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true, result: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
