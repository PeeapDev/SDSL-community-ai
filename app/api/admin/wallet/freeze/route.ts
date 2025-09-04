import { NextResponse } from "next/server"
import { z } from "zod"
import { getAdminSupabase } from "@/lib/supabaseServer"

const Body = z.object({
  userId: z.string().min(1),
  frozen: z.boolean(),
})

function isAdmin(req: Request) {
  return (req.headers.get("x-user-role") || "").toLowerCase() === "admin"
}

export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const json = await req.json().catch(() => null)
    const parsed = Body.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 })

    const { userId, frozen } = parsed.data

    const supabase = getAdminSupabase()
    const { error } = await supabase.rpc("wallet_set_frozen", { p_user: userId, p_frozen: frozen })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
