"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useAdminRightRail } from "@/components/layouts/AdminRightRail"

export default function AdminCardPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Admin • Card Management</CardTitle>
        </CardHeader>
        <CardContent>
          <CardManager />
        </CardContent>
      </Card>
    </div>
  )
}

function CardRequestsPanel() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<Array<{ id: string; user_id: string; role: string | null; requested_at: string }>>([])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/cards/requests/list`, { headers: { "x-user-role": "admin" } })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load")
      setRequests((json.requests || []).map((r: any)=>({ id: r.id, user_id: r.user_id, role: r.role, requested_at: r.requested_at })))
    } catch (e: any) {
      toast({ description: e.message || "Error" })
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-semibold text-slate-300">Card Requests</div>
        <Button size="sm" variant="outline" className="h-7" onClick={load} disabled={loading}>Refresh</Button>
      </div>
      <div className="space-y-2">
        {requests.length === 0 && <div className="text-xs text-slate-500">No pending requests.</div>}
        {requests.map(r => (
          <div key={r.id} className="text-xs flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded p-2">
            <div>
              <div className="font-mono text-slate-200">{r.id}</div>
              <div className="text-slate-400">{r.user_id} • {r.role || '-'} • {new Date(r.requested_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PricingPanel() {
  const { toast } = useToast()
  const [prices, setPrices] = useState<{ student: string; teacher: string; vendor: string }>(() => {
    if (typeof window === 'undefined') return { student: "0", teacher: "0", vendor: "0" }
    try {
      const raw = localStorage.getItem("card_prices")
      return raw ? JSON.parse(raw) : { student: "0", teacher: "0", vendor: "0" }
    } catch { return { student: "0", teacher: "0", vendor: "0" } }
  })

  function save() {
    try {
      localStorage.setItem("card_prices", JSON.stringify(prices))
      toast({ description: "Prices saved" })
    } catch {}
  }

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-lg p-3">
      <div className="text-xs font-semibold text-slate-300 mb-2">Card Pricing</div>
      <div className="space-y-2">
        {(["student","teacher","vendor"] as const).map(role => (
          <div key={role} className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-400 w-20 capitalize">{role}</div>
            <Input value={prices[role]} onChange={(e)=> setPrices(p=>({...p, [role]: e.target.value}))} placeholder="0.00" className="h-8 w-28" />
          </div>
        ))}
        <div className="pt-2">
          <Button size="sm" variant="outline" className="h-8" onClick={save}>Save Prices</Button>
        </div>
      </div>
    </div>
  )
}

function CardPreview({ name, uid, school, account, userIdentifier }: { name: string; uid: string; school?: string | null; account?: string | null; userIdentifier?: string }) {
  const [flipped, setFlipped] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)
  const masked = uid ? (uid.replace(/[^A-Fa-f0-9]/g, "").match(/.{1,4}/g)?.join(" • ") ?? uid) : "XXXX • XXXX • XXXX"

  useEffect(() => {
    if (!flipped) return
    // Load QR only when viewing back
    const id = userIdentifier || name || ""
    if (!id) return
    ;(async () => {
      try {
        const p = new URLSearchParams({ identifier: id }).toString()
        const res = await fetch(`/api/qr?${p}`)
        const json = await res.json()
        if (res.ok) setQr(json.dataUrl)
      } catch {}
    })()
  }, [flipped, userIdentifier, name])

  return (
    <div
      ref={cardRef}
      className="relative w-full aspect-[16/10] mb-4 [perspective:1200px]"
    >
      <div
        onClick={() => setFlipped(v => !v)}
        className={`relative w-full h-full rounded-xl shadow-2xl border border-slate-700/50 overflow-hidden transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {/* Transparent frosted glass: subtle translucent panel with blur */}
          <div className="absolute inset-0 bg-white/5" />
          <div className="absolute inset-0 backdrop-blur-md" />
          <svg viewBox="0 0 640 400" className="w-full h-full block">
            <defs>
              <radialGradient id="glowf" cx="80%" cy="20%" r="60%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="640" height="400" rx="24" fill="url(#glowf)" />
            {/* subtle chip */}
            <rect x="56" y="90" width="72" height="54" rx="8" fill="#ffffff" opacity="0.35" />
            <rect x="64" y="98" width="56" height="38" rx="6" fill="#ffffff" opacity="0.25" />
            <text x="56" y="70" fontSize="22" fontWeight="700" fill="#e2e8f0" fontFamily="ui-sans-serif, system-ui, -apple-system">Campus • Pay</text>
            <text x="56" y="220" fontSize="26" letterSpacing="3px" fill="#e2e8f0" fontFamily="ui-monospace, SFMono-Regular">{masked}</text>
            <text x="56" y="300" fontSize="20" fill="#e2e8f0" fontFamily="ui-sans-serif, system-ui, -apple-system">{name}</text>
            {!!school && <text x="56" y="330" fontSize="14" fill="#e2e8f0" opacity="0.85" fontFamily="ui-sans-serif, system-ui, -apple-system">{school}</text>}
            {!!account && <text x="420" y="330" fontSize="14" fill="#e2e8f0" opacity="0.85" fontFamily="ui-monospace, SFMono-Regular">Acct: {account}</text>}
            {/* subtle brand circles */}
            <circle cx="548" cy="320" r="26" fill="#ffffff" opacity="0.18" />
            <circle cx="584" cy="320" r="26" fill="#ffffff" opacity="0.12" />
            {/* border stroke for glass edge */}
            <rect x="2" y="2" width="636" height="396" rx="22" fill="none" stroke="#ffffff" opacity="0.12" />
          </svg>
        </div>
        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          <div className="absolute left-0 right-0 top-10 mx-auto w-[260px] h-[260px] rounded-lg bg-white/90 flex items-center justify-center">
            {qr ? <img src={qr} alt="QR" className="max-w-full max-h-full" /> : <div className="text-slate-600 text-sm">Loading QR…</div>}
          </div>
          <div className="absolute bottom-6 left-6 right-6 text-slate-200 text-xs">
            Tap to flip • QR encodes user token for closed-loop payments
          </div>
        </div>
      </div>
    </div>
  )
}

function CardManager() {
  const { toast } = useToast()
  const rightRail = useAdminRightRail()
  const [identifier, setIdentifier] = useState("")
  const [resolved, setResolved] = useState<{ user_id: string; handle?: string | null; phone?: string | null; email?: string | null; school_name?: string | null; account_number?: string | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<Array<{ card_uid: string; active: boolean; issued_at: string | null; revoked_at: string | null }>>([])
  const [nfcLink, setNfcLink] = useState<string>("")

  const displayName = useMemo(() => resolved?.handle || resolved?.user_id || (identifier || "—"), [resolved, identifier])
  const activeUid = useMemo(() => (cards.find(c => c.active)?.card_uid || ""), [cards])

  // Mount right-rail content (Card Requests + Pricing)
  useEffect(() => {
    rightRail.setContent(
      <div className="space-y-4">
        <CardRequestsPanel />
        <PricingPanel />
      </div>
    )
    return () => rightRail.clear()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function resolveUser() {
    setLoading(true)
    try {
      const p = new URLSearchParams({ q: identifier }).toString()
      const res = await fetch(`/api/user/resolve?${p}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Resolve failed")
      setResolved(json.user)
      toast({ description: `Resolved user ${json.user.user_id}` })
      await refreshCards(json.user.user_id)
      // Ensure account number exists
      if (!json.user.account_number) {
        const up = await fetch("/api/admin/users/set-account-number", { method: "POST", headers: { "content-type": "application/json", "x-user-role": "admin" }, body: JSON.stringify({ userId: json.user.user_id }) })
        const upj = await up.json()
        if (up.ok) setResolved((r)=> r ? { ...r, account_number: upj.accountNumber } : r)
      }
    } catch (e: any) {
      toast({ description: e.message || "Resolve error" })
    } finally {
      setLoading(false)
    }
  }

  async function refreshCards(userId?: string) {
    const uid = userId || resolved?.user_id
    if (!uid) return
    const res = await fetch("/api/admin/cards/list", {
      method: "POST",
      headers: { "content-type": "application/json", "x-user-role": "admin" },
      body: JSON.stringify({ userId: uid }),
    })
    const json = await res.json()
    if (res.ok) setCards(json.cards || [])
  }

  return (
    <div className="space-y-6">
      {/* Live Card Preview */}
      <div className="w-full">
        <CardPreview name={displayName} uid={activeUid} school={resolved?.school_name} account={resolved?.account_number || undefined} userIdentifier={resolved?.user_id || identifier} />
      </div>

      {/* Directory search */}
      <div className="space-y-2">
        <Label>Search Directory by Handle, Phone, or Email</Label>
        <div className="flex gap-2">
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="@alice • +15551234567 • alice@example.com" />
          <Button onClick={resolveUser} disabled={loading || !identifier}>Search</Button>
        </div>
        {resolved && (
          <div className="text-sm text-muted-foreground">Resolved: {resolved.handle || resolved.user_id}</div>
        )}
      </div>

      {/* Create / Replace Card and NFC link */}
      {resolved && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={async ()=>{
                if (!resolved) return
                const newUid = Array.from({length:10},()=>Math.floor(Math.random()*16).toString(16)).join("").toUpperCase()
                const res = await fetch("/api/admin/cards/link", { method: "POST", headers: { "content-type": "application/json", "x-user-role": "admin" }, body: JSON.stringify({ userId: resolved.user_id, cardUid: newUid }) })
                const json = await res.json()
                if (!res.ok) { toast({ description: json.error || "Failed to create card" }); return }
                setNfcLink(`card:${newUid}`)
                await refreshCards(resolved.user_id)
              }}
            >Create Card</Button>
            <Button variant="outline"
              onClick={async ()=>{
                if (!resolved) return
                const newUid = Array.from({length:10},()=>Math.floor(Math.random()*16).toString(16)).join("").toUpperCase()
                const res = await fetch("/api/admin/cards/link", { method: "POST", headers: { "content-type": "application/json", "x-user-role": "admin" }, body: JSON.stringify({ userId: resolved.user_id, cardUid: newUid }) })
                const json = await res.json()
                if (!res.ok) { toast({ description: json.error || "Failed to replace card" }); return }
                setNfcLink(`card:${newUid}`)
                await refreshCards(resolved.user_id)
              }}
            >Replace Card</Button>
          </div>
          {nfcLink && (
            <div className="flex items-center gap-2 text-sm">
              <div className="px-2 py-1 rounded bg-slate-800/60 border border-slate-700/60 font-mono">{nfcLink}</div>
              <Button size="sm" variant="outline" onClick={()=>{ navigator.clipboard.writeText(nfcLink) }}>Copy</Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
