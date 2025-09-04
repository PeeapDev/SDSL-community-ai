"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"

export default function AdminSupportKBPage() {
  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Support — Knowledge Base</h1>
        <p className="text-slate-400 mt-2">Manage help articles and guides. (Stub)</p>
      </main>
    </MockRoleGuard>
  )
}
