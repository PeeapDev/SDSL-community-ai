"use client"

import { useEffect } from "react"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { getSalesSummary, listProductsByVendor, seedDemoProducts } from "@/lib/productStore"
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard"

export default function VendorHomePage() {
  const { userId } = useMockAuth()

  useEffect(() => {
    try { seedDemoProducts() } catch {}
  }, [])

  const summary = getSalesSummary("v-001") // demo summary
  const products = listProductsByVendor("v-001") // demo vendor

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vendor — Overview</h1>
        <p className="text-slate-400 mt-2">Welcome! Manage your products and view sales at a glance.</p>
      </div>

      {/* Wallet */}
      <section>
        <WalletBalanceCard userId={userId ?? undefined} />
      </section>

      <section className="grid md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Revenue</div>
          <div className="mt-2 text-xl font-semibold">${summary.revenue.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Units</div>
          <div className="mt-2 text-xl font-semibold">{summary.units}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Products</div>
          <div className="mt-2 text-xl font-semibold">{summary.products}</div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Recent Products</h2>
        </div>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {products.slice(0,6).map(p => (
            <div key={p.id} className="rounded border border-slate-800 bg-slate-950/50 p-3">
              <img src={p.imageUrl||"/placeholder.jpg"} className="h-28 w-full object-cover rounded" />
              <div className="mt-2 text-sm font-medium">{p.title}</div>
              <div className="text-xs text-slate-500">${p.price.toFixed(2)}</div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-sm text-slate-400">No products yet. Go to Products to add your first item.</div>
          )}
        </div>
      </section>
    </div>
  )
}

