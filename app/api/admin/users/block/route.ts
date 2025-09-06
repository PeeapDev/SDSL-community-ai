import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function POST(req: NextRequest) {
  const role = req.headers.get("x-user-role")
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { userId, blocked } = await req.json()
    if (!userId || typeof blocked !== "boolean") {
      return NextResponse.json({ error: "userId and blocked(boolean) required" }, { status: 400 })
    }
    const supabase = getAdminSupabase()
    const { data, error } = await supabase
      .from("user_directory")
      .update({ blocked })
      .eq("user_id", userId)
      .select("user_id, handle, display_name, blocked")
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ user: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 400 })
  }
}
