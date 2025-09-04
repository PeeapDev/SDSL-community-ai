"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"

export default function AdminClassesPage() {
  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <p className="text-slate-400 mt-2">Create and manage classes across the institution. (Stub)</p>
      </main>
    </MockRoleGuard>
  )
}
