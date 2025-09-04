"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"

export default function AdminContentTemplatesPage() {
  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Content — Templates</h1>
        <p className="text-slate-400 mt-2">H5P/custom templates management. (Stub)</p>
      </main>
    </MockRoleGuard>
  )
}
