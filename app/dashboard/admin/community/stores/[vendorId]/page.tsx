"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { getVendorProfile, seedVendorProfiles } from "@/lib/vendorStore"
import { listProductsByVendor, seedDemoProducts } from "@/lib/productStore"
import { useEffect, useMemo } from "react"

export default function PublicStorePage() {
  const params = useParams<{ vendorId: string }>()
  const vendorId = params.vendorId

  useEffect(()=>{ try { seedVendorProfiles(); seedDemoProducts() } catch {} }, [])

  const profile = useMemo(()=> getVendorProfile(vendorId), [vendorId])
  const products = useMemo(()=> listProductsByVendor(vendorId), [vendorId])

  if (!profile) return (
    <main className="min-h-screen p-6 text-slate-100">
      <div className="text-sm text-slate-400">Store not found.</div>
    </main>
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100">
      <div className="relative h-40 md:h-56 bg-slate-900 border-b border-slate-800">
        <img src={profile.bannerUrl || "/placeholder.jpg"} className="absolute inset-0 w-full h-full object-cover opacity-60" />
      </div>
      <div className="p-6 -mt-10">
        <div className="flex items-center gap-4">
          <img src={profile.storeAvatarUrl || profile.avatarUrl || "/placeholder-logo.png"} className="h-16 w-16 rounded-lg border border-slate-700 bg-slate-900 object-cover" />
          <div>
            <div className="text-xl font-semibold flex items-center gap-2">
              {profile.displayName}
              {profile.verified && <span className="text-[10px] px-1 py-0.5 rounded bg-cyan-600">Verified</span>}
            </div>
            <div className="text-xs text-slate-400">Rating {profile.rating.toFixed(1)} · {profile.ratingsCount} reviews</div>
          </div>
          <div className="ml-auto">
            <Link href="/dashboard/admin/community/messages" className="text-sm px-3 py-2 rounded bg-slate-800 border border-slate-700">Message</Link>
          </div>
        </div>

        <section className="mt-6">
          <h2 className="text-lg font-semibold">Products</h2>
          <div className="mt-3 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {products.map(p => (
              <div key={p.id} className="rounded border border-slate-800 bg-slate-900/50 p-3">
                <img src={p.imageUrl || "/placeholder.jpg"} className="h-32 w-full object-cover rounded" />
                <div className="mt-2 text-sm font-medium">{p.title}</div>
                <div className="text-xs text-slate-500">${p.price.toFixed(2)}</div>
              </div>
            ))}
            {products.length === 0 && <div className="text-sm text-slate-400">No products yet.</div>}
          </div>
        </section>
      </div>
    </main>
  )
}
