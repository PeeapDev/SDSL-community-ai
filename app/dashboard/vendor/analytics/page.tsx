"use client"

import { useEffect } from "react"
import { getSalesSummary, listProductsByVendor, seedDemoProducts } from "@/lib/productStore"

export default function VendorAnalyticsPage() {
  useEffect(() => { try { seedDemoProducts() } catch {} }, [])

  const vendorId = "v-001" // demo vendor id
  const summary = getSalesSummary(vendorId)
  const products = listProductsByVendor(vendorId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-slate-400 mt-2">High-level sales metrics (mock).</p>
      </div>

      <section className="grid md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Revenue</div>
          <div className="mt-2 text-2xl font-semibold">${summary.revenue.toFixed(2)}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Units Sold</div>
          <div className="mt-2 text-2xl font-semibold">{summary.units}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
          <div className="text-xs text-slate-400">Active Products</div>
          <div className="mt-2 text-2xl font-semibold">{summary.products}</div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="font-semibold">Top Products</h2>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {products.slice(0,6).map(p => (
            <div key={p.id} className="rounded border border-slate-800 bg-slate-950/50 p-3">
              <img src={p.imageUrl||"/placeholder.jpg"} className="h-28 w-full object-cover rounded" />
              <div className="mt-2 text-sm font-medium">{p.title}</div>
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>${p.price.toFixed(2)}</span>
                <span>stock {p.stock}</span>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="text-sm text-slate-400">No products available.</div>
          )}
        </div>
      </section>
    </div>
  )
}
