import { NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 200)
    const userId = req.headers.get("x-user-id") || null
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

    const supabase = getAdminSupabase()
    type Row = {
      id: string
      amount_cents: number
      currency: string
      direction: "debit" | "credit"
      kind: string
      reference_id: string | null
      correlation_id: string | null
      note: string | null
      created_at: string
    }

    const { data, error } = await supabase
      .from("ledger_entries")
      .select("id, amount_cents, currency, direction, kind, reference_id, correlation_id, note, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const rows = (data as Row[]) || []
    const tx = rows.map((r) => ({
      id: r.id,
      amount: (r.direction === "credit" ? 1 : -1) * (r.amount_cents / 100),
      amount_cents: r.amount_cents,
      currency: r.currency,
      type: r.kind,
      reference_id: r.reference_id,
      correlation_id: r.correlation_id,
      note: r.note,
      createdAt: r.created_at,
    }))

    return NextResponse.json({ transactions: tx })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
