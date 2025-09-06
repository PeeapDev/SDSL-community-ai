import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function POST(_req: NextRequest) {
  try {
    const supabase = getAdminSupabase()

    // Demo users
    const demo = [
      { user_id: "demo-student", handle: "student1", phone: "+10000000001", role: "student", display_name: "Student One" },
      { user_id: "demo-teacher", handle: "teacher1", phone: "+10000000002", role: "teacher", display_name: "Teacher One" },
      { user_id: "demo-vendor", handle: "vendor1", phone: "+10000000003", role: "vendor", display_name: "Vendor One" },
    ] as const

    // Upsert directory and roles
    for (const u of demo) {
      await supabase.from("user_directory").upsert({
        user_id: u.user_id,
        handle: u.handle,
        phone: u.phone,
        display_name: u.display_name,
        role: u.role,
      }, { onConflict: "user_id" })
      await supabase.from("user_roles").upsert({ user_id: u.user_id, role: u.role }, { onConflict: "user_id" })
      // Ensure QR secret
      const sec = Math.random().toString(36).slice(2, 12)
      await supabase.from("user_directory").update({ qr_secret: sec }).eq("user_id", u.user_id)
    }

    // Seed balances
    const credits = [
      { user: "demo-student", cents: 5000 },
      { user: "demo-teacher", cents: 10000 },
      { user: "demo-vendor", cents: 0 },
    ]
    for (const c of credits) {
      await supabase.rpc("wallet_admin_adjust", {
        p_user: c.user,
        p_amount_cents: c.cents,
        p_note: "seed",
        p_correlation: `seed_${c.user}`,
      })
    }

    return NextResponse.json({ ok: true, users: demo.map(d=>d.user_id) })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Seed failed" }, { status: 500 })
  }
}
