"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import Link from "next/link"

export default function AdminSettingsGeneralPage() {
  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Settings — General</h1>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/dashboard/admin/settings/general" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">General</Link>
          <Link href="/dashboard/admin/settings/security" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">Security</Link>
          <Link href="/dashboard/admin/settings/billing" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">Billing</Link>
          <Link href="/dashboard/admin/settings/api" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">API</Link>
          <Link href="/dashboard/admin/settings/ai" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">AI</Link>
          <Link href="/dashboard/admin/settings/email" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">Email</Link>
          <Link href="/dashboard/admin/settings/domains" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">Domains</Link>
          <Link href="/dashboard/admin/settings/monitoring" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">Monitoring</Link>
          <Link href="/dashboard/admin/settings/training" className="px-3 py-1.5 rounded border border-slate-800 bg-slate-900 hover:bg-slate-800">Training</Link>
          <Link href="/dashboard/admin/settings/wallet" className="px-3 py-1.5 rounded border border-cyan-700 bg-cyan-900/20 text-cyan-300 hover:bg-cyan-900/40">Wallet</Link>
        </div>
        <p className="text-slate-400 mt-6">Platform name, logo, theme, timezone, language, branding. (Stub)</p>
      </main>
    </MockRoleGuard>
  )
}
