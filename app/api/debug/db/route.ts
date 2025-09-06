import { NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabaseServer"

export async function GET() {
  try {
    const url = process.env.SUPABASE_URL || ""
    const hasUrl = Boolean(url)
    const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

    let wallets: any = null
    let walletsError: string | null = null
    let directory: any = null
    let directoryError: string | null = null

    try {
      const supabase = getAdminSupabase()
      // Probe wallets existence with a harmless maybeSingle select
      const w = await supabase.from("wallets").select("user_id").limit(1)
      if (w.error) walletsError = w.error.message
      else wallets = { count: w.data?.length ?? 0 }

      // Probe user_directory existence similarly
      const d = await supabase.from("user_directory").select("user_id").limit(1)
      if (d.error) directoryError = d.error.message
      else directory = { count: d.data?.length ?? 0 }
    } catch (e: any) {
      // If getAdminSupabase throws due to missing envs
      return NextResponse.json(
        {
          ok: false,
          environment: {
            hasUrl,
            hasServiceRole,
            supabaseUrl: url,
          },
          error: e?.message || String(e),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      environment: {
        hasUrl,
        hasServiceRole,
        supabaseUrl: url,
      },
      probes: {
        wallets: wallets ?? null,
        walletsError,
        user_directory: directory ?? null,
        user_directoryError: directoryError,
      },
    })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Internal error" }, { status: 500 })
  }
}
