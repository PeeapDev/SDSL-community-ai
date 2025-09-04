import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminSupabase } from "@/lib/supabaseServer"

function isAdmin(req: Request) {
  return (req.headers.get("x-user-role") || "").toLowerCase() === "admin"
}

const UpsertBody = z.object({
  role: z.enum(["student","teacher","vendor","admin"]),
  perTxLimit: z.number().nullable().optional(),
  dailyOutflowLimit: z.number().nullable().optional(),
})

export async function GET(req: Request) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const supabase = getAdminSupabase()
    const { data, error } = await supabase.from("role_limits").select("role, per_tx_limit_cents, daily_outflow_limit_cents")
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const result = (data || []).map(r => ({
      role: r.role as "student"|"teacher"|"vendor"|"admin",
      perTxLimit: r.per_tx_limit_cents != null ? r.per_tx_limit_cents/100 : null,
      dailyOutflowLimit: r.daily_outflow_limit_cents != null ? r.daily_outflow_limit_cents/100 : null,
    }))
    return NextResponse.json({ limits: result })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const json = await req.json().catch(()=>null)
    const parsed = UpsertBody.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const { role, perTxLimit, dailyOutflowLimit } = parsed.data
    const supabase = getAdminSupabase()
    const { error } = await supabase.from("role_limits").upsert({
      role,
      per_tx_limit_cents: perTxLimit != null ? Math.round(perTxLimit*100) : null,
      daily_outflow_limit_cents: dailyOutflowLimit != null ? Math.round(dailyOutflowLimit*100) : null,
      updated_at: new Date().toISOString(),
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
