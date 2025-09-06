"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

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

function CardManager() {
  const { toast } = useToast()
  const [identifier, setIdentifier] = useState("")
  const [resolved, setResolved] = useState<{ user_id: string; handle?: string | null; phone?: string | null } | null>(null)
  const [pin, setPin] = useState("")
  const [cardUid, setCardUid] = useState("")
  const [cards, setCards] = useState<Array<{ card_uid: string; active: boolean; issued_at: string | null; revoked_at: string | null }>>([])
  const [loading, setLoading] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [pending, setPending] = useState<Array<{ id: string; user_id: string; role: string | null; requested_at: string }>>([])
  const [approveUid, setApproveUid] = useState<string>("")

  async function fetchQr(idOrIdentifier?: string) {
    const idq = idOrIdentifier || resolved?.user_id || identifier
    if (!idq) return
    const p = new URLSearchParams({ identifier: idq }).toString()
    const res = await fetch(`/api/qr?${p}`)
    const json = await res.json()
    if (res.ok) setQrDataUrl(json.dataUrl)
  }

  async function loadPending() {
    const res = await fetch(`/api/admin/cards/requests/list`, { headers: { "x-user-role": "admin" } })
    const json = await res.json()
    if (res.ok) setPending((json.requests || []).map((r: any)=>({ id: r.id, user_id: r.user_id, role: r.role, requested_at: r.requested_at })))
  }

  async function approveRequest(reqId: string) {
    if (!approveUid) return toast({ description: "Enter a card UID to issue" })
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/cards/requests/approve`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ requestId: reqId, cardUid: approveUid, approvedBy: "admin" })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Approve failed")
      toast({ description: `Approved and issued ${approveUid}` })
      setApproveUid("")
      await loadPending()
    } catch (e: any) {
      toast({ description: e.message || "Approve error" })
    } finally { setLoading(false) }
  }

  async function resolveUser() {
    setLoading(true)
    try {
      const res = await fetch("/api/user/resolve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ identifier }) })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Resolve failed")
      setResolved(json.user)
      toast({ description: `Resolved user ${json.user.user_id}` })
      await refreshCards(json.user.user_id)
      await fetchQr(json.user.user_id)
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

  async function setUserPin() {
    if (!resolved) return toast({ description: "Resolve a user first" })
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users/set-pin", {
        method: "POST",
        headers: { "content-type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ userId: resolved.user_id, pin }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to set PIN")
      toast({ description: "PIN updated" })
      setPin("")
    } catch (e: any) {
      toast({ description: e.message || "Error updating PIN" })
    } finally {
      setLoading(false)
    }
  }

  async function linkCard() {
    if (!resolved) return toast({ description: "Resolve a user first" })
    setLoading(true)
    try {
      const res = await fetch("/api/admin/cards/link", {
        method: "POST",
        headers: { "content-type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ userId: resolved.user_id, cardUid }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Link failed")
      toast({ description: "Card linked" })
      setCardUid("")
      await refreshCards()
    } catch (e: any) {
      toast({ description: e.message || "Link error" })
    } finally {
      setLoading(false)
    }
  }

  async function unlinkCard(uid: string) {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/cards/unlink", {
        method: "POST",
        headers: { "content-type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify({ cardUid: uid }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Unlink failed")
      toast({ description: "Card unlinked" })
      await refreshCards()
    } catch (e: any) {
      toast({ description: e.message || "Unlink error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>User Identifier (@handle, +phone, or user_id)</Label>
        <div className="flex gap-2">
          <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="@alice or +15551234567" />
          <Button onClick={resolveUser} disabled={loading || !identifier}>Resolve</Button>
        </div>
        {resolved && (
          <div className="text-sm text-muted-foreground">Resolved: {resolved.user_id}</div>
        )}
        <div className="flex items-center gap-4 mt-2">
          <Button variant="outline" size="sm" onClick={()=>fetchQr()} disabled={!resolved}>Refresh QR</Button>
          {qrDataUrl && <img src={qrDataUrl} alt="QR" className="h-28 w-28 border rounded" />}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Set Transaction PIN (4-8 digits)</Label>
        <div className="flex gap-2">
          <Input value={pin} onChange={(e) => setPin(e.target.value)} placeholder="1234" type="password" />
          <Button onClick={setUserPin} disabled={loading || !resolved || !pin}>Set PIN</Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Link NFC Card (UID)</Label>
        <div className="flex gap-2">
          <Input value={cardUid} onChange={(e) => setCardUid(e.target.value)} placeholder="04A1B2C3D4" />
          <Button onClick={linkCard} disabled={loading || !resolved || !cardUid}>Link</Button>
        </div>
      </div>

      <div>
        <Label>Linked Cards</Label>
        <div className="mt-2 space-y-2">
          {cards.length === 0 && <div className="text-sm text-muted-foreground">No cards linked.</div>}
          {cards.map((c) => (
            <div key={c.card_uid} className="flex items-center justify-between border rounded-md p-2">
              <div className="text-sm">
                <div>UID: <span className="font-mono">{c.card_uid}</span></div>
                <div className="text-xs text-muted-foreground">Status: {c.active ? "Active" : "Inactive"}</div>
              </div>
              {c.active && (
                <Button variant="outline" size="sm" onClick={() => unlinkCard(c.card_uid)} disabled={loading}>Unlink</Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-2">
          <Label>Pending Card Requests</Label>
          <div className="flex gap-2 items-center">
            <Input placeholder="Card UID to issue" value={approveUid} onChange={(e)=>setApproveUid(e.target.value)} className="h-8 w-48" />
            <Button variant="outline" size="sm" onClick={loadPending}>Refresh</Button>
          </div>
        </div>
        <div className="space-y-2">
          {pending.length === 0 && <div className="text-sm text-muted-foreground">No pending requests.</div>}
          {pending.map(r => (
            <div key={r.id} className="flex items-center justify-between border rounded-md p-2 text-sm">
              <div>
                <div>Request: <span className="font-mono">{r.id}</span></div>
                <div className="text-xs text-muted-foreground">User: {r.user_id} • Role: {r.role || '-'} • {new Date(r.requested_at).toLocaleString()}</div>
              </div>
              <Button size="sm" onClick={()=>approveRequest(r.id)} disabled={!approveUid || loading}>Approve & Issue</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
