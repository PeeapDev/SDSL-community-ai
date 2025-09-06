import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function GET(req: NextRequest) {
  // Require admin role via header gate (until real auth)
  const role = (req.headers.get("x-user-role") || "").toLowerCase()
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const supabase = getAdminSupabase()
  const daysParam = req.nextUrl.searchParams.get("days")
  const days = daysParam ? Math.max(1, Math.min(365, Number(daysParam) || 30)) : 30
  const sinceIso = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  try {
    // Fetch recent transfers
    const { data: transfers, error: tErr } = await supabase
      .from("transfers")
      .select("from_user_id, to_user_id, amount_cents, created_at")
      .gte("created_at", sinceIso)
      .limit(5000)
    if (tErr) throw tErr

    // Collect distinct user_ids to look up gender
    const userSet = new Set<string>()
    for (const t of transfers || []) {
      if (t.from_user_id) userSet.add(t.from_user_id)
      if (t.to_user_id) userSet.add(t.to_user_id)
    }
    const userIds = Array.from(userSet)

    // Lookup directory entries
    let directory: Record<string, { gender: string | null }> = {}
    if (userIds.length) {
      const { data: dir, error: dErr } = await supabase
        .from("user_directory")
        .select("user_id, gender")
        .in("user_id", userIds)
      if (dErr) throw dErr
      for (const row of dir || []) directory[row.user_id] = { gender: row.gender ?? null }
    }

    // Aggregate by payer gender (from_user_id)
    const byGender: Record<string, number> = {}
    let totalCents = 0
    for (const t of transfers || []) {
      const g = directory[t.from_user_id]?.gender || "unknown"
      byGender[g] = (byGender[g] || 0) + (Number(t.amount_cents) || 0)
      totalCents += Number(t.amount_cents) || 0
    }

    const chart = Object.entries(byGender).map(([gender, cents]) => ({ gender, amount_cents: cents, amount: cents / 100 }))

    return NextResponse.json({
      days,
      since: sinceIso,
      total_cents: totalCents,
      total: totalCents / 100,
      by_gender: chart,
      count: transfers?.length || 0,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Stats failed" }, { status: 500 })
  }
}
