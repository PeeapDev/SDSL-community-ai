import { NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function GET() {
  try {
    const supabase = getAdminSupabase()
    // Try user_roles table first
    const { data, error } = await supabase.from("user_roles").select("user_id").eq("role", "admin").limit(1)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const adminUserId = data?.[0]?.user_id || null
    if (!adminUserId) return NextResponse.json({ error: "No admin user found" }, { status: 404 })
    return NextResponse.json({ adminUserId })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
