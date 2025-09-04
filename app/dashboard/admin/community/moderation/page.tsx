"use client"

import { useEffect, useState } from "react"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { listReports, moderateReport } from "@/lib/communityStore"
import { listPosts, type Post } from "@/lib/communityStore"

export default function AdminCommunityModerationPage() {
  const [reports, setReports] = useState(listReports())
  const [flagged, setFlagged] = useState<Post[]>([])

  function refresh() {
    setReports(listReports())
    setFlagged(listPosts().filter(p => p.status === "flagged"))
  }
  useEffect(()=>{ refresh() }, [])

  function act(id: string, action: "approve" | "remove" | "dismiss") {
    moderateReport(id, action)
    refresh()
  }

  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Community — Moderation</h1>
        <p className="text-slate-400 mt-2">Review reports and flagged content. Actions persist locally.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Flagged Queue</h2>
            <div className="mt-3 text-sm text-slate-300 space-y-2">
              {flagged.length === 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded p-3 text-slate-400">No flagged items.</div>
              )}
              {flagged.map(f => (
                <div key={f.id} className="bg-slate-900 border border-slate-800 rounded p-3">
                  <div className="text-xs text-slate-500">by {f.authorRole} • {new Date(f.createdAt).toLocaleString()}</div>
                  <div className="mt-1 line-clamp-3 text-sm">{f.text}</div>
                  <div className="mt-2 text-xs text-amber-400">Status: {f.status}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 md:col-span-2">
            <h2 className="font-semibold">Reports</h2>
            {reports.length === 0 && (
              <div className="mt-3 text-sm text-slate-400">No reports yet.</div>
            )}
            <div className="mt-3 space-y-3">
              {reports.map(r => (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div>Target: {r.targetType} • Reason: {r.reason}</div>
                    <div>{new Date(r.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-1 text-xs">Status: <span className="text-amber-300">{r.status}</span></div>
                  <div className="mt-2 flex gap-2 text-sm">
                    <button onClick={()=>act(r.id, "approve")} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700">Approve</button>
                    <button onClick={()=>act(r.id, "remove")} className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700">Remove</button>
                    <button onClick={()=>act(r.id, "dismiss")} className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700">Dismiss</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </MockRoleGuard>
  )
}
