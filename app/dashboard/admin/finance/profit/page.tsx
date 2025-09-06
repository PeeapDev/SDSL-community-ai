"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminFinanceProfitPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Profit Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-400">Coming soon: platform profit breakdown, fees collected, payouts, and net revenue.</div>
        </CardContent>
      </Card>
    </div>
  )
}
