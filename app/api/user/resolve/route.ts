import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

function normalizeIdentifier(input: string) {
  const raw = input.trim()
  if (!raw) return { kind: "empty" as const }
  if (raw.startsWith("@")) return { kind: "handle" as const, value: raw.slice(1).toLowerCase() }
  // E.164-ish normalization: keep leading + and digits
  const digits = raw.replace(/[^0-9+]/g, "")
  if (/^\+?[0-9]{7,15}$/.test(digits)) {
    const value = digits.startsWith("+") ? digits : "+" + digits
    return { kind: "phone" as const, value }
  }
  return { kind: "user_id" as const, value: raw }
}

export async function GET(req: NextRequest) {
  const supabase = getAdminSupabase()
  const q = req.nextUrl.searchParams.get("q")
  const selfUserId = req.headers.get("x-user-id") || undefined

  try {
    if (!q) {
      if (!selfUserId) return NextResponse.json({ error: "Missing x-user-id header" }, { status: 400 })
      const { data, error } = await supabase
        .from("user_directory")
        .select("user_id, handle, phone, display_name, school_name, account_number, email")
        .eq("user_id", selfUserId)
        .maybeSingle()
      if (error) throw error
      return NextResponse.json({ user: data || { user_id: selfUserId } })
    }

    const norm = normalizeIdentifier(q)

    if (norm.kind === "handle") {
      const { data, error } = await supabase
        .from("user_directory")
        .select("user_id, handle, phone, display_name, school_name, account_number, email")
        .ilike("handle", norm.value)
        .maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: "User not found" }, { status: 404 })
      return NextResponse.json({ user: data })
    }

    if (norm.kind === "phone") {
      const { data, error } = await supabase
        .from("user_directory")
        .select("user_id, handle, phone, display_name, school_name, account_number, email")
        .eq("phone", norm.value)
        .maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: "User not found" }, { status: 404 })
      return NextResponse.json({ user: data })
    }

    // user_id fallback
    return NextResponse.json({ user: { user_id: norm.value } })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Resolve failed" }, { status: 500 })
  }
}
