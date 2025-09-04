"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const nav = [
    { label: "Feed", href: "/dashboard/admin/community/feed" },
    { label: "Messages", href: "/dashboard/admin/community/messages" },
    { label: "Friends", href: "/dashboard/admin/community/friends" },
    { label: "Groups", href: "/dashboard/admin/community/groups" },
    { label: "Moderation", href: "/dashboard/admin/community/moderation" },
    { label: "Settings", href: "/dashboard/admin/community/settings" },
  ]
  const competitions = [
    { label: "Create Live Quiz", href: "/dashboard/admin/community/competitions/create" },
    { label: "Manage Events", href: "/dashboard/admin/community/competitions/events" },
    { label: "Leaderboards", href: "/dashboard/admin/community/competitions/leaderboards" },
    { label: "Reports", href: "/dashboard/admin/community/competitions/reports" },
  ]

  return (
    <MockRoleGuard allow={["admin","teacher","student","vendor"]}>
      <div className="min-h-screen grid md:grid-cols-[260px_1fr] bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100">
        <aside className="border-r border-slate-800 p-4 sticky top-0 h-screen hidden md:block">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Community</div>
            <button onClick={()=>router.push("/dashboard/admin")} className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">Back</button>
          </div>
          <nav className="mt-4 space-y-1">
            {nav.map((n)=>{
              const active = pathname?.startsWith(n.href)
              return (
                <Link key={n.href} href={n.href} className={`block px-3 py-2 rounded border ${active?"bg-slate-800 border-slate-600":"bg-slate-900 border-slate-800 hover:bg-slate-800"}`}>
                  {n.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-6 text-xs uppercase tracking-wide text-slate-500">Competitions</div>
          <nav className="mt-2 space-y-1">
            {competitions.map((n)=>{
              const active = pathname?.startsWith(n.href)
              return (
                <Link key={n.href} href={n.href} className={`block px-3 py-2 rounded border ${active?"bg-slate-800 border-slate-600":"bg-slate-900 border-slate-800 hover:bg-slate-800"}`}>
                  {n.label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="p-6">{children}</main>
      </div>
    </MockRoleGuard>
  )
}
