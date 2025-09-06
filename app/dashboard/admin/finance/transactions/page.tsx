"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

const COLORS = ["#06b6d4", "#22c55e", "#f59e0b", "#8b5cf6", "#ef4444", "#3b82f6", "#14b8a6", "#84cc16"]

type Slice = { gender: string; amount: number; amount_cents: number }

type Stats = {
  days: number
  since: string
  total: number
  total_cents: number
  by_gender: Slice[]
  count: number
}

export default function AdminTransactionsPage() {
  const { role } = useMockAuth()
  const [days, setDays] = useState(30)
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const data = useMemo(() => stats?.by_gender || [], [stats])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/transactions/stats?days=${days}`, {
        headers: { "x-user-role": role },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to load stats")
      setStats(json)
    } catch (e: any) {
      setError(e.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days])

  return (
    <MockRoleGuard allow={["admin"]}>
      <div className="container mx-auto p-6">
        <Card className="mx-auto">
          <CardHeader>
            <CardTitle>Transactions by Gender</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3">
              <Label>Window (days)</Label>
              <div className="flex gap-2">
                {[7, 14, 30, 90].map((d) => (
                  <Button key={d} variant={d === days ? "default" : "outline"} size="sm" onClick={() => setDays(d)}>
                    {d}d
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
                {loading ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="h-[360px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data} dataKey="amount" nameKey="gender" cx="50%" cy="50%" outerRadius={120} label>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                  )}
                </Pie>
                <Tooltip formatter={(value: any) => `$${Number(value).toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {stats && (
            <div className="text-sm text-slate-500">
              Total volume: <span className="font-medium text-slate-300">${stats.total.toFixed(2)}</span> across {stats.count} transfers since {new Date(stats.since).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </MockRoleGuard>
  )
}
