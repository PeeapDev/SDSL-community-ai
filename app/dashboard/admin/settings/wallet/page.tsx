"use client"

import { useEffect, useMemo, useState } from "react"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { useMockAuth } from "@/components/providers/MockAuthProvider"

const ROLES = ["student","teacher","vendor","admin"] as const

type Role = typeof ROLES[number]

type Limit = { role: Role; perTxLimit: number|null; dailyOutflowLimit: number|null }

export default function AdminWalletSettingsPage() {
  const { role } = useMockAuth()
  const allow: (typeof role)[] = ["admin"]

  // Adjust balance state
  const [userId, setUserId] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [adjMsg, setAdjMsg] = useState<string>("")
  const [adjErr, setAdjErr] = useState<string>("")
  const [adjLoading, setAdjLoading] = useState(false)

  // Freeze state
  const [freezeUserId, setFreezeUserId] = useState("")
  const [frozen, setFrozen] = useState(false)
  const [freezeMsg, setFreezeMsg] = useState("")
  const [freezeErr, setFreezeErr] = useState("")
  const [freezeLoading, setFreezeLoading] = useState(false)

  // Role limits
  const [limits, setLimits] = useState<Limit[]>([])
  const [limitsMsg, setLimitsMsg] = useState("")
  const [limitsErr, setLimitsErr] = useState("")
  const [limitsLoading, setLimitsLoading] = useState(false)

  async function fetchLimits() {
    try {
      setLimitsLoading(true)
      const res = await fetch("/api/admin/wallet/limits", { headers: { "x-user-role": "admin" } })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to load limits")
      const byRole: Record<Role, Limit> = Object.fromEntries(ROLES.map(r=>[r, { role: r, perTxLimit: null, dailyOutflowLimit: null }])) as any
      ;(data.limits as Limit[]).forEach((l: Limit)=>{ byRole[l.role] = l })
      setLimits(ROLES.map(r=>byRole[r]))
    } catch (e:any) {
      setLimitsErr(e.message)
    } finally {
      setLimitsLoading(false)
    }
  }

  useEffect(()=>{ fetchLimits() }, [])

  async function doAdjust() {
    setAdjMsg(""); setAdjErr("")
    const amt = parseFloat(amount)
    if (!userId) { setAdjErr("Enter user ID"); return }
    if (!(amt || amt===0)) { setAdjErr("Enter amount"); return }
    try {
      setAdjLoading(true)
      const res = await fetch("/api/admin/wallet/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ userId, amount: amt, note: note || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to adjust")
      setAdjMsg("Adjusted successfully")
      setUserId(""); setAmount(""); setNote("")
    } catch (e:any) {
      setAdjErr(e.message)
    } finally {
      setAdjLoading(false)
    }
  }

  async function doFreeze() {
    setFreezeMsg(""); setFreezeErr("")
    if (!freezeUserId) { setFreezeErr("Enter user ID"); return }
    try {
      setFreezeLoading(true)
      const res = await fetch("/api/admin/wallet/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ userId: freezeUserId, frozen })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update freeze state")
      setFreezeMsg(frozen ? "Wallet frozen" : "Wallet unfrozen")
      setFreezeUserId("")
      setFrozen(false)
    } catch (e:any) {
      setFreezeErr(e.message)
    } finally {
      setFreezeLoading(false)
    }
  }

  async function saveLimit(role: Role, update: Partial<Limit>) {
    setLimitsMsg(""); setLimitsErr("")
    try {
      const payload = {
        role,
        perTxLimit: update.perTxLimit ?? limits.find(l=>l.role===role)?.perTxLimit ?? null,
        dailyOutflowLimit: update.dailyOutflowLimit ?? limits.find(l=>l.role===role)?.dailyOutflowLimit ?? null,
      }
      const res = await fetch("/api/admin/wallet/limits", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save limit")
      setLimitsMsg("Saved")
      fetchLimits()
    } catch (e:any) {
      setLimitsErr(e.message)
    }
  }

  return (
    <MockRoleGuard allow={allow}>
      <main className="min-h-screen p-6 text-slate-100 bg-gradient-to-b from-black via-slate-900 to-slate-950">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold">Wallet Settings</h1>
          <p className="text-slate-400 mt-1">Admin can adjust balances, freeze accounts, and set per-role limits.</p>

          {/* Adjust balance */}
          <section className="mt-6 rounded border border-slate-800 bg-slate-900/50 p-4">
            <div className="font-semibold">Adjust Balance</div>
            <div className="grid md:grid-cols-3 gap-3 mt-3 text-sm">
              <div className="grid gap-1">
                <label className="text-slate-400">User ID</label>
                <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="u-001" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
              </div>
              <div className="grid gap-1">
                <label className="text-slate-400">Amount (USD)</label>
                <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="10.00 (negative to debit)" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
              </div>
              <div className="grid gap-1">
                <label className="text-slate-400">Note</label>
                <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Adjustment reason" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
              </div>
            </div>
            {adjErr && <div className="text-xs text-rose-400 mt-2">{adjErr}</div>}
            {adjMsg && <div className="text-xs text-emerald-400 mt-2">{adjMsg}</div>}
            <div className="mt-3">
              <button disabled={adjLoading} onClick={doAdjust} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-sm disabled:opacity-60">{adjLoading?"Adjusting...":"Adjust"}</button>
            </div>
          </section>

          {/* Freeze accounts */}
          <section className="mt-6 rounded border border-slate-800 bg-slate-900/50 p-4">
            <div className="font-semibold">Freeze / Unfreeze Account</div>
            <div className="grid md:grid-cols-[2fr_1fr_1fr] gap-3 mt-3 text-sm">
              <div className="grid gap-1">
                <label className="text-slate-400">User ID</label>
                <input value={freezeUserId} onChange={e=>setFreezeUserId(e.target.value)} placeholder="u-001" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
              </div>
              <div className="grid gap-1">
                <label className="text-slate-400">Frozen</label>
                <select value={frozen?"yes":"no"} onChange={e=>setFrozen(e.target.value==="yes")} className="bg-slate-950 border border-slate-800 rounded px-3 py-2">
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
              <div className="flex items-end">
                <button disabled={freezeLoading} onClick={doFreeze} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-sm disabled:opacity-60 w-full">{freezeLoading?"Saving...":"Save"}</button>
              </div>
            </div>
            {freezeErr && <div className="text-xs text-rose-400 mt-2">{freezeErr}</div>}
            {freezeMsg && <div className="text-xs text-emerald-400 mt-2">{freezeMsg}</div>}
          </section>

          {/* Role limits */}
          <section className="mt-6 rounded border border-slate-800 bg-slate-900/50 p-4">
            <div className="font-semibold">Per-role Limits</div>
            {limitsLoading ? (
              <div className="text-sm text-slate-400 mt-3">Loading...</div>
            ) : (
              <div className="mt-3 grid gap-3">
                {limits.map(l => (
                  <div key={l.role} className="grid md:grid-cols-[1fr_1fr_1fr_120px] gap-3 text-sm items-end">
                    <div>
                      <div className="text-slate-300">Role</div>
                      <div className="font-medium capitalize">{l.role}</div>
                    </div>
                    <div className="grid gap-1">
                      <label className="text-slate-400">Per-transaction limit (USD)</label>
                      <input defaultValue={l.perTxLimit ?? ""} onBlur={e=> saveLimit(l.role, { perTxLimit: e.target.value? parseFloat(e.target.value) : null })} placeholder="e.g. 100.00" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                    </div>
                    <div className="grid gap-1">
                      <label className="text-slate-400">Daily outflow limit (USD)</label>
                      <input defaultValue={l.dailyOutflowLimit ?? ""} onBlur={e=> saveLimit(l.role, { dailyOutflowLimit: e.target.value? parseFloat(e.target.value) : null })} placeholder="e.g. 500.00" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                    </div>
                    <div>
                      <button onClick={()=> saveLimit(l.role, {})} className="px-3 py-2 rounded border border-slate-700 text-sm hover:bg-slate-800 w-full">Save</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {limitsErr && <div className="text-xs text-rose-400 mt-2">{limitsErr}</div>}
            {limitsMsg && <div className="text-xs text-emerald-400 mt-2">{limitsMsg}</div>}
          </section>
        </div>
      </main>
    </MockRoleGuard>
  )
}
