"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"

export default function AdminFinanceProfitPage() {
  return (
    <MockRoleGuard allow={["admin"]}>
      <div className="container mx-auto p-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Profit Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500">Coming soon: platform profit breakdown, fees collected, payouts, and net revenue.</div>
          </CardContent>
        </Card>
      </div>
    </MockRoleGuard>
  )
}
