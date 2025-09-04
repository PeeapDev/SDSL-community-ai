"use client"

import { useEffect, useMemo, useState } from "react"
import { getVendorProfile, seedVendorProfiles, upsertVendorProfile, type VendorProfile } from "@/lib/vendorStore"

export default function VendorShopSetupPage() {
  const vendorId = "v-001" // demo
  const [profile, setProfile] = useState<VendorProfile | null>(null)

  useEffect(()=>{ try { seedVendorProfiles() } catch {};
    const p = getVendorProfile(vendorId)
    if (p) setProfile(p)
  },[])

  function save(changes: Partial<VendorProfile>) {
    if (!profile) return
    const updated = { ...profile, ...changes }
    upsertVendorProfile(updated)
    setProfile(updated)
  }

  async function toDataURL(file: File): Promise<string> {
    return await new Promise((resolve)=>{
      const reader = new FileReader()
      reader.onload = ()=> resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Shop Setup</h1>
        <p className="text-slate-400 mt-2">Upload your shop banner and logo.</p>
      </div>

      {/* Banner */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="font-semibold">Banner</h2>
        <div className="mt-3 grid gap-3">
          <div className="aspect-[5/1] w-full rounded overflow-hidden border border-slate-800 bg-slate-950">
            <img src={profile.bannerUrl || "/placeholder.jpg"} className="w-full h-full object-cover" />
          </div>
          <input type="file" accept="image/*" onChange={async (e)=>{
            const f = e.target.files?.[0]; if(!f) return
            const data = await toDataURL(f)
            save({ bannerUrl: data })
          }} />
        </div>
      </section>

      {/* Shop Logo */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="font-semibold">Shop Logo</h2>
        <div className="mt-3 flex items-center gap-4">
          <img src={profile.storeAvatarUrl || profile.avatarUrl || "/placeholder-logo.png"} className="h-20 w-20 rounded-lg border border-slate-800 object-cover" />
          <input type="file" accept="image/*" onChange={async (e)=>{
            const f = e.target.files?.[0]; if(!f) return
            const data = await toDataURL(f)
            save({ storeAvatarUrl: data })
          }} />
        </div>
      </section>
    </div>
  )
}
