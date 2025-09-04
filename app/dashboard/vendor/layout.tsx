"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { getVendorProfile, seedVendorProfiles } from "@/lib/vendorStore"
import { listNotifications } from "@/lib/notificationsStore"
import { Bell, MessagesSquare, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { userId, signOut } = useMockAuth()
  const { theme, setTheme } = useTheme()
  const [tick, setTick] = useState(0)
  useEffect(() => { try { seedVendorProfiles() } catch {} }, [])
  const vendorId = "v-001" // demo
  const profile = useMemo(()=> getVendorProfile(vendorId), [vendorId, tick])
  const notifCount = useMemo(()=> userId ? listNotifications(userId).filter(n=>!n.read).length : 0, [userId, tick])

  const [walletOpen, setWalletOpen] = useState(true)
  const nav = [
    { label: "Overview", href: "/dashboard/vendor" },
    { label: "Products", href: "/dashboard/vendor/products" },
    { label: "Analytics", href: "/dashboard/vendor/analytics" },
    { label: "__WALLET_GROUP__" },
    { label: "Shop Setup", href: "/dashboard/vendor/shop" },
    { label: "Chat", href: "/dashboard/vendor/chat" },
    { label: "Settings", href: "/dashboard/vendor/settings" },
  ]
  return (
    <MockRoleGuard allow={["vendor", "admin"]}>
      <div className="min-h-screen grid md:grid-cols-[240px_1fr] bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100">
        <aside className="border-r border-slate-800 p-4 sticky top-0 h-screen hidden md:block">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Vendor</div>
            <button onClick={()=>router.push("/dashboard/admin")} className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">Back</button>
          </div>
          <nav className="mt-4 space-y-1">
            {nav.map(n => {
              if (n.label === "__WALLET_GROUP__") {
                const groupActive = pathname?.startsWith("/dashboard/vendor/wallet")
                return (
                  <div key="wallet-group" className="space-y-1">
                    <button
                      onClick={()=> setWalletOpen(o=>!o)}
                      className={`w-full text-left block px-3 py-2 rounded border ${groupActive?"bg-slate-800 border-slate-600":"bg-slate-900 border-slate-800 hover:bg-slate-800"}`}
                    >
                      Wallet
                    </button>
                    {walletOpen && (
                      <div className="ml-3 space-y-1">
                        <Link href="/dashboard/vendor/wallet" className={`block px-3 py-1.5 rounded text-sm ${pathname === "/dashboard/vendor/wallet"?"bg-slate-800":"hover:bg-slate-800"}`}>Overview</Link>
                        <Link href="/dashboard/vendor/wallet?tab=send" className="block px-3 py-1.5 rounded text-sm hover:bg-slate-800">Send</Link>
                        <Link href="/dashboard/vendor/wallet?tab=receive" className="block px-3 py-1.5 rounded text-sm hover:bg-slate-800">Receive</Link>
                        <Link href="/dashboard/vendor/wallet?tab=transactions" className="block px-3 py-1.5 rounded text-sm hover:bg-slate-800">Transactions</Link>
                      </div>
                    )}
                  </div>
                )
              }
              const active = n.href ? pathname?.startsWith(n.href) : false
              if (!n.href) return null
              return (
                <Link key={n.href} href={n.href} className={`block px-3 py-2 rounded border ${active?"bg-slate-800 border-slate-600":"bg-slate-900 border-slate-800 hover:bg-slate-800"}`}>
                  {n.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="p-0">
          {/* Top bar: avatar, notifications, theme toggle, logout grouped */}
          <div className="sticky top-0 z-40 flex items-center gap-3 px-4 h-14 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
            <Link href="/dashboard/vendor/settings" className="h-9 w-9 rounded-full overflow-hidden border border-slate-700 bg-slate-900">
              <img src={profile?.avatarUrl || "/placeholder-logo.png"} className="h-full w-full object-cover" />
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <Link href="/dashboard/vendor/chat" title="Messages" className="relative h-9 w-9 grid place-items-center rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800">
                <MessagesSquare size={16} />
              </Link>
              <Link href="/dashboard/vendor/orders" title="Notifications" className="relative h-9 w-9 grid place-items-center rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800">
                <Bell size={16} />
                {notifCount>0 && <span className="absolute -top-1 -right-1 text-[10px] bg-rose-500 text-white rounded-full px-1">{notifCount}</span>}
              </Link>
              <button onClick={()=> setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme" className="h-9 w-9 grid place-items-center rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800">
                {theme === "dark" ? <Sun size={16}/> : <Moon size={16}/>}
              </button>
              <button onClick={()=>{ signOut(); router.push("/") }} className="px-3 py-1.5 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm">Logout</button>
            </div>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </MockRoleGuard>
  )
}
