"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"

export default function AdminContentAIActivitiesPage() {
  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Content — AI Activities</h1>
        <p className="text-slate-400 mt-2">Review and manage AI-generated activities. (Stub)</p>
      </main>
    </MockRoleGuard>
  )
}
