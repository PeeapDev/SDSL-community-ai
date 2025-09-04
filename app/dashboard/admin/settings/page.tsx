"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminSettingsPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard/admin/settings/general")
  }, [router])
  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <p className="text-slate-400">Redirecting to General Settings…</p>
      </main>
    </MockRoleGuard>
  )
}
