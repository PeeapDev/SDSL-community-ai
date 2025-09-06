"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function PayTestPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Dev • Pay & Card Test</h1>
      <TestCards />
      <TestPay />
    </div>
  )
}

function TestCards() {
  const { toast } = useToast()
  const [identifier, setIdentifier] = useState("")
  const [resolved, setResolved] = useState<string | null>(null)
  const [pin, setPin] = useState("")
  const [cardUid, setCardUid] = useState("")
  const [cards, setCards] = useState<any[]>([])

  async function resolveUser() {
    const res = await fetch("/api/user/resolve", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ identifier }) })
    const json = await res.json()
    if (!res.ok) return toast({ description: json.error || "Resolve failed" })
    setResolved(json.user.user_id)
    toast({ description: `Resolved ${json.user.user_id}` })
    await refreshCards(json.user.user_id)
  }

  async function refreshCards(uid?: string) {
    const userId = uid || resolved
    if (!userId) return
    const res = await fetch("/api/admin/cards/list", { method: "POST", headers: { "content-type": "application/json", "x-user-role": "admin" }, body: JSON.stringify({ userId }) })
    const json = await res.json()
    if (!res.ok) return toast({ description: json.error || "List failed" })
    setCards(json.cards || [])
  }

  async function setUserPin() {
    if (!resolved) return toast({ description: "Resolve first" })
    const res = await fetch("/api/admin/users/set-pin", { method: "POST", headers: { "content-type": "application/json", "x-user-role": "admin" }, body: JSON.stringify({ userId: resolved, pin }) })
    const json = await res.json()
    if (!res.ok) return toast({ description: json.error || "Set PIN failed" })
    toast({ description: "PIN set" })
    setPin("")
  }

  async function linkCard() {
    if (!resolved) return toast({ description: "Resolve first" })
    const res = await fetch("/api/admin/cards/link", { method: "POST", headers: { "content-type": "application/json", "x-user-role": "admin" }, body: JSON.stringify({ userId: resolved, cardUid }) })
    const json = await res.json()
    if (!res.ok) return toast({ description: json.error || "Link failed" })
    toast({ description: "Card linked" })
    setCardUid("")
    await refreshCards()
  }

  async function unlinkCard(uid: string) {
    const res = await fetch("/api/admin/cards/unlink", { method: "POST", headers: { "content-type": "application/json", "x-user-role": "admin" }, body: JSON.stringify({ cardUid: uid }) })
    const json = await res.json()
    if (!res.ok) return toast({ description: json.error || "Unlink failed" })
    toast({ description: "Card unlinked" })
    await refreshCards()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin • Card Ops</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>User Identifier</Label>
          <div className="flex gap-2">
            <Input value={identifier} onChange={(e)=>setIdentifier(e.target.value)} placeholder="@alice or +1555... or user_id" />
            <Button onClick={resolveUser} disabled={!identifier}>Resolve</Button>
          </div>
          {resolved && <div className="text-xs text-muted-foreground">Resolved: {resolved}</div>}
        </div>

        <div className="space-y-2">
          <Label>Set PIN</Label>
          <div className="flex gap-2">
            <Input value={pin} onChange={(e)=>setPin(e.target.value)} placeholder="1234" type="password" />
            <Button onClick={setUserPin} disabled={!resolved || !pin}>Set PIN</Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Link Card</Label>
          <div className="flex gap-2">
            <Input value={cardUid} onChange={(e)=>setCardUid(e.target.value)} placeholder="04A1B2C3D4" />
            <Button onClick={linkCard} disabled={!resolved || !cardUid}>Link</Button>
          </div>
        </div>

        <div>
          <Label>Linked Cards</Label>
          <div className="mt-2 space-y-2">
            {cards.length === 0 && <div className="text-sm text-muted-foreground">No cards.</div>}
            {cards.map((c)=> (
              <div key={c.card_uid} className="flex items-center justify-between border rounded-md p-2">
                <div className="text-sm">{c.card_uid} • {c.active ? "active" : "inactive"}</div>
                {c.active && <Button size="sm" variant="outline" onClick={()=>unlinkCard(c.card_uid)}>Unlink</Button>}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TestPay() {
  const { toast } = useToast()
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [amount, setAmount] = useState("1.00")
  const [pin, setPin] = useState("")
  const [note, setNote] = useState("")

  async function doPay() {
    const res = await fetch("/api/pay", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ from, to, amount: Number(amount), pin, note }) })
    const json = await res.json()
    if (!res.ok) return toast({ description: json.error || "Pay failed" })
    toast({ description: `OK transfer id=${json.transfer?.id || ""}` })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>From (user_id | @handle | +phone | qr:SECRET | card:UID)</Label>
            <Input value={from} onChange={(e)=>setFrom(e.target.value)} placeholder="card:04A1B2C3D4" />
          </div>
          <div className="space-y-1">
            <Label>To (user_id | @handle | +phone | qr:SECRET | card:UID)</Label>
            <Input value={to} onChange={(e)=>setTo(e.target.value)} placeholder="@vendor1" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Amount (USD)</Label>
            <Input value={amount} onChange={(e)=>setAmount(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>PIN</Label>
            <Input value={pin} onChange={(e)=>setPin(e.target.value)} type="password" />
          </div>
          <div className="space-y-1">
            <Label>Note</Label>
            <Input value={note} onChange={(e)=>setNote(e.target.value)} />
          </div>
        </div>
        <Button onClick={doPay} disabled={!from || !to || !pin}>Send Payment</Button>
      </CardContent>
    </Card>
  )
}
