"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"

export default function NotificationsPage() {
  return (
    <MockRoleGuard allow={["student","teacher","admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-slate-400 mt-2">This is a simple notifications hub for now. Community reports, likes, replies and system notices can appear here in the future.</p>
        <div className="mt-6 space-y-3 text-sm">
          <div className="bg-slate-900/50 border border-slate-800 rounded p-4">No notifications yet.</div>
        </div>
      </main>
    </MockRoleGuard>
  )
}
