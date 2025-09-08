"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useMockAuth } from "@/components/providers/MockAuthProvider"

type CardProduct = { id: string; name: string; type: string; price: string; imageUrl?: string; active: boolean }

export default function StudentCardPage() {
  return (
    <MockRoleGuard allow={["student"]}>
      <Marketplace />
    </MockRoleGuard>
  )
}

function Marketplace() {
  const { toast } = useToast()
  const { userId } = useMockAuth()
  const [products, setProducts] = useState<CardProduct[]>([])
  const [idx, setIdx] = useState(0)
  const [balance, setBalance] = useState<number | null>(null)
  const [pin, setPin] = useState("")
  const current = products[idx]

  // Load products from admin Card Products (localStorage) with sensible defaults
  useEffect(() => {
    try {
      const raw = localStorage.getItem("admin_card_products")
      const list: CardProduct[] = raw ? JSON.parse(raw) : []
      const filtered = list.filter((p) => p.active)
      setProducts(
        filtered.length > 0 ? filtered : [
          { id: "gold", name: "Campus Gold", type: "gold", price: "9.99", imageUrl: undefined, active: true },
          { id: "silver", name: "Campus Silver", type: "silver", price: "4.99", imageUrl: undefined, active: true },
        ]
      )
    } catch {
      setProducts([
        { id: "gold", name: "Campus Gold", type: "gold", price: "9.99", imageUrl: undefined, active: true },
        { id: "silver", name: "Campus Silver", type: "silver", price: "4.99", imageUrl: undefined, active: true },
      ])
    }
  }, [])

  // Load wallet balance
  useEffect(() => {
    if (!userId) return
    ;(async () => {
      const res = await fetch("/api/wallet/balance", { headers: { "x-user-id": userId } })
      const json = await res.json()
      if (res.ok) setBalance(Number(json.balance))
    })()
  }, [userId])

  const price = useMemo(() => (current ? Number(current.price) : 0), [current])
  const canAfford = balance !== null && balance >= price
  const canPurchase = !!userId && !!current && canAfford && pin.length >= 4

  async function purchase() {
    if (!userId || !current) return
    try {
      // Resolve admin user to receive funds
      const adminRes = await fetch("/api/admin/resolve")
      const adminJson = await adminRes.json()
      if (!adminRes.ok) throw new Error(adminJson.error || "Admin not found")
      const adminId = adminJson.adminUserId as string

      // Transfer funds
      const payRes = await fetch("/api/pay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from: userId, to: adminId, amount: price, pin, note: `Purchase card: ${current.name}` }),
      })
      const payJson = await payRes.json()
      if (!payRes.ok) throw new Error(payJson.error || "Payment failed")

      // Create card request
      const reqRes = await fetch("/api/cards/request", { method: "POST", headers: { "content-type": "application/json", "x-user-id": userId }, body: JSON.stringify({ role: "student" }) })
      const reqJson = await reqRes.json()
      if (!reqRes.ok) throw new Error(reqJson.error || "Request failed")

      toast({ description: `Purchased ${current.name}. Request #${reqJson.requestId}` })
      // Refresh balance
      const bal = await fetch("/api/wallet/balance", { headers: { "x-user-id": userId } })
      const balJ = await bal.json()
      if (bal.ok) setBalance(Number(balJ.balance))
      setPin("")
    } catch (e: any) {
      toast({ description: e.message || "Failed" })
    }
  }

  if (!current) return <div className="text-sm text-slate-400">No card products configured.</div>

  return (
    <div className="w-full">
      <div className="mb-3 text-slate-200 text-lg font-semibold">Choose Your Card</div>

      {/* Big glassy sliding card */}
      <div className="relative w-full max-w-2xl mx-auto">
        <Button
          variant="ghost"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/30 hover:bg-slate-900/50"
          onClick={()=> setIdx((i)=> (i-1+products.length)%products.length)}
        >
          &larr;
        </Button>
        <Button
          variant="ghost"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-900/30 hover:bg-slate-900/50"
          onClick={()=> setIdx((i)=> (i+1)%products.length)}
        >
          &rarr;
        </Button>

        <div className="h-56" />
        <div className="relative -mt-56 h-56">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="mx-auto w-[480px] max-w-full aspect-[16/9] rounded-2xl border border-white/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/5" />
              <div className="absolute inset-0 backdrop-blur-md" />
              <svg viewBox="0 0 640 360" className="w-full h-full block">
                <defs>
                  <radialGradient id="glowm" cx="80%" cy="20%" r="60%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="640" height="360" rx="24" fill="url(#glowm)" />
                {/* subtle chip */}
                <rect x="48" y="72" width="68" height="50" rx="8" fill="#ffffff" opacity="0.35" />
                <rect x="56" y="80" width="52" height="34" rx="6" fill="#ffffff" opacity="0.25" />
                <text x="48" y="58" fontSize="20" fontWeight="700" fill="#e2e8f0" fontFamily="ui-sans-serif, system-ui, -apple-system">{current.name}</text>
                <text x="48" y="210" fontSize="24" letterSpacing="3px" fill="#e2e8f0" fontFamily="ui-monospace, SFMono-Regular">{current.type.toUpperCase()}</text>
                <text x="48" y="284" fontSize="18" fill="#22d3ee" fontFamily="ui-monospace, SFMono-Regular">${price.toFixed(2)}</text>
                <rect x="2" y="2" width="636" height="356" rx="22" fill="none" stroke="#ffffff" opacity="0.12" />
              </svg>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Wallet + PIN + Purchase */}
      <div className="mt-6 max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <div className="text-xs text-slate-400">Wallet Balance</div>
          <div className="text-lg font-mono text-slate-100">{balance === null ? "—" : `$${balance.toFixed(2)}`}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-slate-400 mb-1">Enter App PIN</div>
          <Input value={pin} onChange={(e)=> setPin(e.target.value)} type="password" placeholder="••••" className="max-w-xs" />
        </div>
      </div>

      <div className="mt-4 max-w-2xl mx-auto flex items-center gap-3">
        <Button onClick={purchase} disabled={!canPurchase}>
          {canAfford ? `Purchase ${current.name}` : `Insufficient balance`}
        </Button>
        {!canAfford && <div className="text-xs text-amber-400">Top up your wallet to continue.</div>}
      </div>
    </div>
  )
}
