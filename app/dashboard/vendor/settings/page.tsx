"use client"

import { useEffect, useMemo, useState } from "react"
import { getVendorProfile, seedVendorProfiles, upsertVendorProfile, type VendorProfile } from "@/lib/vendorStore"

export default function VendorSettingsPage() {
  const vendorId = "v-001" // demo vendor
  const [profile, setProfile] = useState<VendorProfile | null>(null)

  useEffect(() => {
    try { seedVendorProfiles() } catch {}
    const p = getVendorProfile(vendorId) || {
      vendorId,
      displayName: "My Store",
      verified: false,
      rating: 0,
      ratingsCount: 0,
      kyc: { status: "unsubmitted" },
      notifications: { marketing: true, productUpdates: true, orders: true },
    } as VendorProfile
    setProfile(p)
  }, [])

  function save(changes: Partial<VendorProfile>) {
    if (!profile) return
    const updated = { ...profile, ...changes }
    upsertVendorProfile(updated)
    setProfile(updated)
  }

  function submitKYC(fields: Record<string,string>) {
    save({ kyc: { status: "pending", submittedAt: Date.now(), fields } as VendorProfile["kyc"] })
  }

  if (!profile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-2">Manage your vendor profile, store visuals, notifications and verification.</p>
      </div>

      {/* Profile visuals (avatar only; banner/logo in Shop Setup) */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
          <div className="grid gap-1">
            <label className="text-slate-400">Display Name</label>
            <input value={profile.displayName} onChange={e=>save({ displayName: e.target.value })} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
          </div>
          <div className="grid gap-1">
            <label className="text-slate-400">Bio</label>
            <input value={profile.bio || ""} onChange={e=>save({ bio: e.target.value })} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
          </div>
          <div className="grid gap-2">
            <label className="text-slate-400">Avatar</label>
            <div className="flex items-center gap-3">
              <img src={profile.avatarUrl || "/placeholder-logo.png"} className="h-12 w-12 rounded-full border border-slate-800 object-cover" />
              <input type="file" accept="image/*" onChange={async (e)=>{
                const file = e.target.files?.[0]; if(!file) return
                const reader = new FileReader()
                reader.onload = () => { save({ avatarUrl: reader.result as string }) }
                reader.readAsDataURL(file)
              }} />
            </div>
            <p className="text-xs text-slate-500">Shop banner and logo are in Shop Setup.</p>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="font-semibold">Notifications</h2>
        <div className="mt-3 grid md:grid-cols-3 gap-3 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={profile.notifications.orders} onChange={e=>save({ notifications: { ...profile.notifications, orders: e.target.checked } })} /> Orders</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={profile.notifications.productUpdates} onChange={e=>save({ notifications: { ...profile.notifications, productUpdates: e.target.checked } })} /> Product updates</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={profile.notifications.marketing} onChange={e=>save({ notifications: { ...profile.notifications, marketing: e.target.checked } })} /> Marketing</label>
        </div>
      </section>

      {/* Verification */}
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Verification (KYC)</h2>
          <div className="text-xs">Status: <span className="font-medium">{profile.kyc.status}</span></div>
        </div>
        {profile.kyc.status === "unsubmitted" || profile.kyc.status === "rejected" ? (
          <KYCForm onSubmit={submitKYC} />
        ) : (
          <p className="text-sm text-slate-400 mt-2">Your verification is {profile.kyc.status}. We'll notify you once reviewed by admin.</p>
        )}
      </section>
    </div>
  )
}

function KYCForm({ onSubmit }: { onSubmit: (fields: Record<string,string>) => void }) {
  const [name, setName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [address, setAddress] = useState("")
  return (
    <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
      <div className="grid gap-1">
        <label className="text-slate-400">Full Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
      </div>
      <div className="grid gap-1">
        <label className="text-slate-400">Government ID Number</label>
        <input value={idNumber} onChange={e=>setIdNumber(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
      </div>
      <div className="md:col-span-2 grid gap-1">
        <label className="text-slate-400">Address</label>
        <input value={address} onChange={e=>setAddress(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
      </div>
      <div className="md:col-span-2 flex justify-end">
        <button onClick={()=>onSubmit({ name, idNumber, address })} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700">Submit for review</button>
      </div>
    </div>
  )
}
