import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function POST(req: NextRequest) {
  const role = (req.headers.get("x-user-role") || "").toLowerCase()
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const json = await req.json().catch(() => null)
    const { userId, accountNumber } = (json || {}) as { userId?: string; accountNumber?: string }
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })

    const supabase = getAdminSupabase()

    let acct = (accountNumber || "").replace(/\D/g, "")
    if (!acct) {
      // generate 10-digit number
      acct = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("")
    }
    if (acct.length !== 10) return NextResponse.json({ error: "accountNumber must be 10 digits" }, { status: 400 })

    const { error } = await supabase.from("user_directory").update({ account_number: acct }).eq("user_id", userId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true, accountNumber: acct })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
