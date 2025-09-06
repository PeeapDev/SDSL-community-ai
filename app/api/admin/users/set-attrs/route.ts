import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

const VALID_GENDERS = new Set(["male", "female", "other"]) as Set<string>
const VALID_ROLES = new Set(["student", "teacher", "vendor", "admin"]) as Set<string>

export async function POST(req: NextRequest) {
  const role = (req.headers.get("x-user-role") || "").toLowerCase()
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { userId, identifier, gender, role: newRole } = body || {}
  if (!userId && !identifier) {
    return NextResponse.json({ error: "Provide userId or identifier" }, { status: 400 })
  }
  if (gender && !VALID_GENDERS.has(String(gender))) {
    return NextResponse.json({ error: "Invalid gender" }, { status: 400 })
  }
  if (newRole && !VALID_ROLES.has(String(newRole))) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const supabase = getAdminSupabase()

  try {
    // Resolve user_id if identifier provided
    let targetUserId: string | null = userId || null
    if (!targetUserId) {
      const norm = String(identifier).trim().toLowerCase()
      let q = supabase.from("user_directory").select("user_id, handle, phone").limit(1)
      if (norm.startsWith("@")) {
        q = q.eq("handle", norm.slice(1))
      } else if (norm.startsWith("+")) {
        q = q.eq("phone", norm)
      } else {
        q = q.eq("user_id", norm)
      }
      const { data: rows, error: rErr } = await q
      if (rErr) throw rErr
      if (!rows || rows.length === 0) return NextResponse.json({ error: "User not found" }, { status: 404 })
      targetUserId = rows[0].user_id
    }

    // Update gender if provided
    let updated: any = { user_id: targetUserId }
    if (gender) {
      const { error: gErr } = await supabase
        .from("user_directory")
        .update({ gender })
        .eq("user_id", targetUserId as string)
      if (gErr) throw gErr
      updated.gender = gender
    }

    // Upsert role into user_roles if provided
    if (newRole) {
      const { error: uErr } = await supabase
        .from("user_roles")
        .upsert({ user_id: targetUserId as string, role: newRole }, { onConflict: "user_id" })
      if (uErr) throw uErr
      updated.role = newRole
    }

    return NextResponse.json({ ok: true, user: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 500 })
  }
}
