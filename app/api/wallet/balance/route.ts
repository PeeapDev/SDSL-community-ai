import { NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function GET(req: Request) {
  try {
    const userId = req.headers.get("x-user-id") || null
    if (!userId) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })

    const supabase = getAdminSupabase()
    const { data, error } = await supabase.from("wallets").select("available_cents").eq("user_id", userId).maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    const cents = data?.available_cents ?? 0
    return NextResponse.json({ balance_cents: cents, balance: cents / 100 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
