"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowRightLeft, History } from "lucide-react"

export function WalletBalanceCard({ userId }: { userId?: string }) {
  const [balance, setBalance] = useState<number>(0)
  const [recent, setRecent] = useState<{ id: string; amount: number; type: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  async function load() {
    if (!userId) return
    setError("")
    try {
      setLoading(true)
      const [b, t] = await Promise.all([
        fetch("/api/wallet/balance", { headers: { "x-user-id": userId } }).then(r=>r.json()),
        fetch("/api/wallet/transactions?limit=3", { headers: { "x-user-id": userId } }).then(r=>r.json()),
      ])
      if (b.error) throw new Error(b.error)
      if (t.error) throw new Error(t.error)
      setBalance(b.balance || 0)
      setRecent((t.transactions || []).slice(0,3))
    } catch (e:any) {
      setError(e.message || "Failed to load wallet")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [userId])

  const formatted = useMemo(() => balance.toFixed(2), [balance])

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-slate-100 text-base flex items-center">
          <Wallet className="mr-2 h-5 w-5 text-emerald-500" /> Wallet
        </CardTitle>
        <Button disabled variant="outline" size="sm" className="h-8 border-slate-700/60 opacity-60">Open</Button>
      </CardHeader>
      <CardContent>
        {userId ? (
          <div className="space-y-3">
            {error && <div className="text-xs text-rose-400">{error}</div>}
            <div>
              <div className="text-xs text-slate-500">Current Balance</div>
              <div className="text-2xl font-semibold text-slate-100">${formatted}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button disabled size="sm" className="bg-cyan-600 hover:bg-cyan-700 opacity-60"><ArrowRightLeft className="h-4 w-4 mr-1" />Transfer</Button>
              <Button disabled variant="secondary" size="sm" className="bg-slate-800/70 text-slate-200 border border-slate-700/60 hover:bg-slate-800 opacity-60">
                <History className="h-4 w-4 mr-1" />History
              </Button>
            </div>
            <div className="pt-2 border-t border-slate-700/50">
              <div className="text-xs text-slate-500 mb-2">Recent</div>
              <div className="space-y-2">
                {recent.length === 0 && (
                  <div className="text-xs text-slate-500">No transactions yet.</div>
                )}
                {recent.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <div className="text-slate-300 capitalize">{t.type}</div>
                    <div className={amountClass(t.amount)}>{t.amount >= 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-500">Sign in to view your wallet.</div>
        )}
      </CardContent>
    </Card>
  )
}

function amountClass(a: number) {
  return a >= 0 ? "text-emerald-400" : "text-rose-400"
}

// labelFor removed; using API's type directly
