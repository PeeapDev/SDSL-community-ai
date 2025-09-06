"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function TeacherCardPage() {
  return (
    <MockRoleGuard allow={["teacher"]}>
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Request NFC Card</CardTitle>
        </CardHeader>
        <CardContent>
          <CardRequest roleHint="teacher" />
        </CardContent>
      </Card>
    </MockRoleGuard>
  )
}

function CardRequest({ roleHint }: { roleHint?: string }) {
  const { toast } = useToast()
  async function requestCard() {
    const res = await fetch("/api/cards/request", { method: "POST", headers: { "content-type": "application/json", "x-user-id": "demo-teacher" }, body: JSON.stringify({ role: roleHint }) })
    const json = await res.json()
    if (!res.ok) return toast({ description: json.error || "Failed" })
    toast({ description: `Requested: ${json.requestId}` })
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Submit a request to Admin to issue an NFC card linked to your account.</p>
      <Button onClick={requestCard}>Request Card</Button>
    </div>
  )
}
