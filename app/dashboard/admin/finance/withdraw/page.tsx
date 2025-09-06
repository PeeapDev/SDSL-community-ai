"use client"

import { useEffect, useMemo, useState } from "react"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function AdminFinanceWithdrawPage() {
  const { userId, role } = useMockAuth()
  const [identifier, setIdentifier] = useState("")
  const [resolved, setResolved] = useState<null | { user_id: string; handle?: string | null; display_name?: string | null }>(null)
  const [amount, setAmount] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => {
    return role === "admin" && resolved?.user_id && Number(amount) > 0
  }, [role, resolved?.user_id, amount])

  useEffect(() => {
    setResolved(null)
  }, [identifier])

  async function handleResolve() {
    if (!identifier.trim()) return
    try {
      const res = await fetch(`/api/user/resolve?q=${encodeURIComponent(identifier)}`, {
        headers: {
          "x-user-id": userId || "",
        },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to resolve")
      setResolved(data.user)
      toast.success("User resolved")
    } catch (e: any) {
      toast.error(e.message || "Resolve failed")
    }
  }

  async function handleWithdraw() {
    if (!resolved?.user_id) return
    if (!(Number(amount) > 0)) return toast.error("Enter positive amount")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/wallet/adjust", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-user-role": "admin",
          "x-idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({ userId: resolved.user_id, amount: -Number(amount), note: note || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Adjust failed")
      toast.success("Withdrawal completed")
      setAmount("")
      setNote("")
    } catch (e: any) {
      toast.error(e.message || "Withdraw failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <MockRoleGuard allow={["admin"]}>
      <div className="container mx-auto p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Admin Withdraw</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-2">
              <Input placeholder="@alice or +15551234567 or user_id" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
              <Button variant="secondary" onClick={handleResolve}>Resolve</Button>
            </div>
            {resolved && (
              <div className="text-sm text-slate-500">
                Target: <Badge variant="outline">{resolved.display_name || resolved.handle || resolved.user_id}</Badge>
              </div>
            )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Amount (USD)</Label>
              <Input type="number" inputMode="decimal" placeholder="25.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Note (optional)</Label>
              <Input placeholder="Reason" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleWithdraw} disabled={!canSubmit || loading}>
              {loading ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </MockRoleGuard>
  )
}
