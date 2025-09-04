"use client"

import { useEffect, useMemo, useState } from "react"
import { useMockAuth } from "@/components/providers/MockAuthProvider"

export type WalletPanelProps = {
  defaultTab?: "overview" | "send" | "receive" | "transactions"
}

export function WalletPanel({ defaultTab = "overview" }: WalletPanelProps) {
  const { userId } = useMockAuth()
  const [tab, setTab] = useState<typeof defaultTab>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string>("")

  const [balance, setBalance] = useState<number>(0)
  const [txs, setTxs] = useState<any[]>([])

  const [toInput, setToInput] = useState("") // @username, phone, or userId
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")

  // Receive details and QR
  const [directory, setDirectory] = useState<{ user_id?: string; handle?: string | null; phone?: string | null } | null>(null)
  const [qrAmount, setQrAmount] = useState("")
  const [qrNote, setQrNote] = useState("")
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [dirSaving, setDirSaving] = useState(false)
  const [dirMsg, setDirMsg] = useState<string>("")
  const [handleInput, setHandleInput] = useState("")
  const [phoneInput, setPhoneInput] = useState("")
  const [displayNameInput, setDisplayNameInput] = useState("")

  async function load() {
    if (!userId) return
    setErr("")
    try {
      const [b, t, dir] = await Promise.all([
        fetch("/api/wallet/balance", { headers: { "x-user-id": userId } }).then(r=>r.json()),
        fetch("/api/wallet/transactions?limit=100", { headers: { "x-user-id": userId } }).then(r=>r.json()),
        fetch("/api/user/resolve", { headers: { "x-user-id": userId } }).then(r=>r.json()).catch(()=>({}))
      ])
      if (b.error) throw new Error(b.error)
      if (t.error) throw new Error(t.error)
      setBalance(b.balance)
      setTxs(t.transactions || [])
      if (dir && dir.user) setDirectory(dir.user)
    } catch (e:any) {
      setErr(e.message || "Failed to load wallet")
    }
  }

  // Sync the editable inputs with the loaded directory info
  useEffect(() => {
    if (directory) {
      setHandleInput(directory.handle || "")
      setPhoneInput(directory.phone || "")
      // @ts-ignore optional field from backend
      setDisplayNameInput((directory as any)?.display_name || "")
    }
  }, [directory])

  // Save @handle / phone / display name to the user directory
  async function saveDirectory() {
    if (!userId) return
    setDirMsg("")
    setDirSaving(true)
    try {
      const res = await fetch("/api/user/directory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({
          handle: handleInput || undefined,
          phone: phoneInput || undefined,
          displayName: displayNameInput || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update profile")
      if (data?.user) setDirectory(data.user)
      setDirMsg("Saved")
    } catch (e:any) {
      setDirMsg(e.message || "Failed to update profile")
    } finally {
      setDirSaving(false)
    }
  }

  useEffect(()=>{ load() }, [userId])

  async function doSend() {
    if (!userId) return
    setLoading(true); setErr("")
    try {
      const amt = parseFloat(amount)
      if (!(amt>0)) throw new Error("Enter a valid amount")
      if (!toInput) throw new Error("Enter recipient (@username, phone, or user ID)")

      // Resolve identifier to user_id
      const resolved = await fetch(`/api/user/resolve?q=${encodeURIComponent(toInput.trim())}`).then(r=>r.json())
      if (resolved.error || !resolved.user?.user_id) throw new Error(resolved.error || "Recipient not found")
      const toUserId = resolved.user.user_id as string

      const res = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({ toUserId, amount: amt, note: note || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Transfer failed")
      setToInput(""); setAmount(""); setNote("")
      await load()
      setTab("transactions")
    } catch (e:any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function generateQr() {
    if (!userId) return
    try {
      setErr("")
      const payload = {
        t: "pay",
        to: userId,
        amt: qrAmount ? parseFloat(qrAmount) : undefined,
        n: qrNote || undefined,
      }
      const text = JSON.stringify(payload)
      // dynamic import to avoid hard dependency
      // @ts-ignore - optional dependency; install with `pnpm add qrcode` to enable
      const mod = await import("qrcode").catch(() => null as any)
      if (!mod || !mod.toDataURL) {
        setErr("QR generator not installed. Run: pnpm add qrcode")
        return
      }
      const url = await mod.toDataURL(text, { width: 256, margin: 1 })
      setQrDataUrl(url)
    } catch (e:any) {
      setErr(e.message || "Failed to generate QR")
    }
  }

  return (
    <div className="rounded border border-slate-800 bg-slate-900/50">
      <div className="flex flex-wrap gap-2 p-3 border-b border-slate-800 text-sm">
        <button onClick={()=>setTab("overview")} className={`px-3 py-1.5 rounded ${tab==="overview"?"bg-slate-800 border border-slate-700":"border border-slate-800 hover:bg-slate-800"}`}>Overview</button>
        <button onClick={()=>setTab("send")} className={`px-3 py-1.5 rounded ${tab==="send"?"bg-slate-800 border border-slate-700":"border border-slate-800 hover:bg-slate-800"}`}>Send</button>
        <button onClick={()=>setTab("receive")} className={`px-3 py-1.5 rounded ${tab==="receive"?"bg-slate-800 border border-slate-700":"border border-slate-800 hover:bg-slate-800"}`}>Receive</button>
        <button onClick={()=>setTab("transactions")} className={`px-3 py-1.5 rounded ${tab==="transactions"?"bg-slate-800 border border-slate-700":"border border-slate-800 hover:bg-slate-800"}`}>Transactions</button>
      </div>

      {err && <div className="px-4 pt-3 text-xs text-rose-400">{err}</div>}

      {/* Overview */}
      {tab === "overview" && (
        <div className="p-4">
          <div className="text-sm text-slate-400">Current Balance</div>
          <div className="text-3xl font-semibold mt-1">${balance.toFixed(2)}</div>
          <div className="text-xs text-slate-500 mt-2">This reflects your on-platform wallet balance.</div>
        </div>
      )}

      {/* Send */}
      {tab === "send" && (
        <div className="p-4 grid gap-2 text-sm">
          <div className="grid gap-1">
            <label className="text-slate-400">To (@username, phone, or User ID)</label>
            <input value={toInput} onChange={e=>setToInput(e.target.value)} placeholder="e.g. @merchant or +15551234567 or u-123" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
          </div>
          <div className="grid gap-1">
            <label className="text-slate-400">Amount (USD)</label>
            <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="10.00" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
          </div>
          <div className="grid gap-1">
            <label className="text-slate-400">Note (optional)</label>
            <input value={note} onChange={e=>setNote(e.target.value)} placeholder="Payment for order #123" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
          </div>
          <div className="mt-2">
            <button disabled={loading} onClick={doSend} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60">{loading?"Sending...":"Send"}</button>
          </div>
        </div>
      )}

      {/* Receive */}
      {tab === "receive" && (
        <div className="p-4 text-sm">
          <div className="space-y-2">
            <div>
              <div className="text-slate-400">Your User ID</div>
              <div className="mt-2 flex items-center gap-2">
                <code className="px-2 py-1 rounded bg-slate-950 border border-slate-800">{userId}</code>
                <button onClick={()=>{ navigator.clipboard?.writeText(userId||"") }} className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800">Copy</button>
              </div>
            </div>
            {/* Directory editor */}
            <div className="mt-2 p-3 rounded border border-slate-800 bg-slate-900/40">
              <div className="text-slate-300 font-medium mb-2">Directory (Username & Phone)</div>
              <div className="grid md:grid-cols-3 gap-2">
                <div className="grid gap-1">
                  <label className="text-slate-400 text-xs">@username</label>
                  <input value={handleInput} onChange={e=>setHandleInput(e.target.value)} placeholder="e.g. merchant_one" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                </div>
                <div className="grid gap-1">
                  <label className="text-slate-400 text-xs">Phone (+country)</label>
                  <input value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} placeholder="e.g. +15551234567" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                </div>
                <div className="grid gap-1">
                  <label className="text-slate-400 text-xs">Display name</label>
                  <input value={displayNameInput} onChange={e=>setDisplayNameInput(e.target.value)} placeholder="e.g. Merchant One" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button disabled={dirSaving} onClick={saveDirectory} className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60">{dirSaving?"Saving...":"Save"}</button>
                {dirMsg && <span className={`text-xs ${dirMsg==="Saved"?"text-emerald-400":"text-amber-400"}`}>{dirMsg}</span>}
              </div>
            </div>
            {directory && (
              <div className="flex flex-col gap-1">
                {directory.handle && (
                  <div>
                    <span className="text-slate-400">Handle</span>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-slate-950 border border-slate-800">@{directory.handle}</code>
                      <button onClick={()=>{ navigator.clipboard?.writeText(`@${directory.handle}`) }} className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800">Copy</button>
                    </div>
                  </div>
                )}
                {directory.phone && (
                  <div>
                    <span className="text-slate-400">Phone</span>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="px-2 py-1 rounded bg-slate-950 border border-slate-800">{directory.phone}</code>
                      <button onClick={()=>{ navigator.clipboard?.writeText(directory.phone||"") }} className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800">Copy</button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="pt-2 border-t border-slate-800">
              <div className="text-slate-400 mb-2">Payment QR</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                <div className="grid gap-1">
                  <label className="text-slate-400 text-xs">Amount (optional)</label>
                  <input value={qrAmount} onChange={e=>setQrAmount(e.target.value)} placeholder="e.g. 12.50" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                </div>
                <div className="grid gap-1 md:col-span-2">
                  <label className="text-slate-400 text-xs">Note (optional)</label>
                  <input value={qrNote} onChange={e=>setQrNote(e.target.value)} placeholder="e.g. Order #123" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <button onClick={generateQr} className="px-4 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700">Generate QR</button>
                {!qrDataUrl && <span className="text-xs text-slate-500">QR requires the optional 'qrcode' package. If missing, you'll see an error above.</span>}
              </div>
              {qrDataUrl && (
                <div className="mt-3 p-3 inline-block bg-white rounded">
                  <img src={qrDataUrl} alt="Payment QR" width={256} height={256} />
                </div>
              )}
            </div>
            <div className="text-xs text-slate-500 mt-2">Share your ID, @handle, phone, or this QR to receive transfers.</div>
          </div>
        </div>
      )}

      {/* Transactions */}
      {tab === "transactions" && (
        <div className="p-4">
          <div className="divide-y divide-slate-800">
            {txs.map((tx) => (
              <div key={tx.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium capitalize">{tx.type}</div>
                  <div className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString()}</div>
                  {tx.note && <div className="text-xs text-slate-400 mt-1">{tx.note}</div>}
                </div>
                <div className={tx.amount>=0?"text-emerald-400":"text-rose-400"}>{tx.amount>=0?"+":""}${tx.amount.toFixed(2)}</div>
              </div>
            ))}
            {txs.length===0 && <div className="text-sm text-slate-400">No transactions yet.</div>}
          </div>
        </div>
      )}
    </div>
  )
}
