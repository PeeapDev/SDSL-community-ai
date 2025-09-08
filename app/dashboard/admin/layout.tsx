"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { AdminRightRailProvider, RightRailSlot } from "@/components/layouts/AdminRightRail"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  BarChart3,
  Database,
  DollarSign,
  Globe,
  Hexagon,
  Lock,
  MessageSquare,
  PieChart,
  Radio,
  Search,
  Settings,
  Shield,
  Terminal,
  Wifi,
  ChevronDown,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Always call hooks unconditionally to preserve hook order
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d") as CanvasRenderingContext2D | null
    if (!ctx) return
    const canvas = c as HTMLCanvasElement
    const DPR = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
    const resize = () => {
      const { clientWidth, clientHeight } = canvas
      canvas.width = Math.floor(clientWidth * DPR)
      canvas.height = Math.floor(clientHeight * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()

    type P = { x:number;y:number;vx:number;vy:number;size:number;color:string }
    const particles: P[] = Array.from({ length: 80 }, () => ({
      x: Math.random()*canvas.clientWidth,
      y: Math.random()*canvas.clientHeight,
      vx: (Math.random()-0.5)*0.4,
      vy: (Math.random()-0.5)*0.4,
      size: Math.random()*2+1,
      color: `rgba(${Math.floor(Math.random()*80)+120}, ${Math.floor(Math.random()*80)+120}, ${Math.floor(Math.random()*80)+200}, ${Math.random()*0.4+0.1})`
    }))

    let raf = 0
    const tick = () => {
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy
        if (p.x > canvas.clientWidth) p.x = 0
        if (p.x < 0) p.x = canvas.clientWidth
        if (p.y > canvas.clientHeight) p.y = 0
        if (p.y < 0) p.y = canvas.clientHeight
        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
        ctx.fill()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  // If on overview root, bypass the chrome but keep hooks called above
  if (pathname === "/dashboard/admin") {
    return (
      <MockRoleGuard allow={["admin"]}>{children}</MockRoleGuard>
    )
  }

  return (
    <MockRoleGuard allow={["admin"]}>
      <AdminRightRailProvider>
        <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
          <div className="container mx-auto p-4 relative z-10">
          {/* Header (condensed) */}
          <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
            <div className="flex items-center space-x-2">
              <Hexagon className="h-6 w-6 text-cyan-500" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Campus AI Admin</span>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/50 rounded-full px-3 py-1 border border-slate-700/50">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-48 placeholder:text-slate-500 text-slate-200" />
            </div>
          </header>

          <div className="grid grid-cols-12 gap-6">
            {/* Sidebar (reuses same groups as main admin dashboard) */}
            <div className="col-span-12 md:col-span-3 lg:col-span-2">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    <NavItem icon={Terminal} label="Overview" href="/dashboard/admin" active={pathname === "/dashboard/admin"} />

                    <NavGroup id="user_mgmt" label="User Management">
                      <NavItem icon={Database} label="Schools" href="/dashboard/admin/users/schools" active={pathname?.startsWith("/dashboard/admin/users/schools")} />
                      <NavItem icon={Database} label="Teachers" href="/dashboard/admin/users/teachers" active={pathname?.startsWith("/dashboard/admin/users/teachers")} />
                      <NavItem icon={Database} label="Students" href="/dashboard/admin/users/students" active={pathname?.startsWith("/dashboard/admin/users/students")} />
                      <NavItem icon={Database} label="Support Staff" href="/dashboard/admin/users/support" active={pathname?.startsWith("/dashboard/admin/users/support")} />
                      <NavItem icon={Database} label="Roles & Permissions" href="/dashboard/admin/users/roles" active={pathname?.startsWith("/dashboard/admin/users/roles")} />
                    </NavGroup>

                    <NavGroup id="finance" label="Finance">
                      <NavItem icon={DollarSign} label="Deposit" href="/dashboard/admin/finance/deposit" active={pathname?.startsWith("/dashboard/admin/finance/deposit")} />
                      <NavItem icon={DollarSign} label="Withdraw" href="/dashboard/admin/finance/withdraw" active={pathname?.startsWith("/dashboard/admin/finance/withdraw")} />
                      <NavItem icon={Lock} label="Card" href="/dashboard/admin/finance/card" active={pathname?.startsWith("/dashboard/admin/finance/card")} />
                      <NavItem icon={PieChart} label="Profit" href="/dashboard/admin/finance/profit" active={pathname?.startsWith("/dashboard/admin/finance/profit")} />
                      <NavItem icon={BarChart3} label="Transactions" href="/dashboard/admin/finance/transactions" active={pathname?.startsWith("/dashboard/admin/finance/transactions")} />
                    </NavGroup>

                    <NavGroup id="community" label="Community">
                      <NavItem icon={MessageSquare} label="Feed" href="/dashboard/admin/community/feed" active={pathname?.startsWith("/dashboard/admin/community/feed")} />
                      <NavItem icon={MessageSquare} label="Messages" href="/dashboard/admin/community/messages" active={pathname?.startsWith("/dashboard/admin/community/messages")} />
                      <NavItem icon={MessageSquare} label="Friends" href="/dashboard/admin/community/friends" active={pathname?.startsWith("/dashboard/admin/community/friends")} />
                      <NavItem icon={Settings} label="Community Settings" href="/dashboard/admin/community/settings" active={pathname?.startsWith("/dashboard/admin/community/settings")} />
                      <NavItem icon={Shield} label="Moderation" href="/dashboard/admin/community/moderation" active={pathname?.startsWith("/dashboard/admin/community/moderation")} />
                    </NavGroup>

                    <NavGroup id="ai_mgmt" label="AI Management">
                      <NavItem icon={Radio} label="Prompt Templates" href="/dashboard/admin/ai/prompts" active={pathname?.startsWith("/dashboard/admin/ai/prompts")} />
                      <NavItem icon={Radio} label="Image Generation" href="/dashboard/admin/ai/images" active={pathname?.startsWith("/dashboard/admin/ai/images")} />
                      <NavItem icon={Radio} label="Agent Settings" href="/dashboard/admin/ai/agent" active={pathname?.startsWith("/dashboard/admin/ai/agent")} />
                      <NavItem icon={Radio} label="Usage Logs" href="/dashboard/admin/ai/logs" active={pathname?.startsWith("/dashboard/admin/ai/logs")} />
                    </NavGroup>

                    <NavGroup id="system" label="System Settings">
                      <NavItem icon={Settings} label="General" href="/dashboard/admin/settings/general" active={pathname?.startsWith("/dashboard/admin/settings/general")} />
                      <NavItem icon={Terminal} label="Billing" href="/dashboard/admin/settings/billing" active={pathname?.startsWith("/dashboard/admin/settings/billing")} />
                      <NavItem icon={Shield} label="Security" href="/dashboard/admin/settings/security" active={pathname?.startsWith("/dashboard/admin/settings/security")} />
                      <NavItem icon={Globe} label="Domains & Subdomains" href="/dashboard/admin/settings/domains" active={pathname?.startsWith("/dashboard/admin/settings/domains")} />
                      <NavItem icon={Wifi} label="System Monitoring" href="/dashboard/admin/settings/monitoring" active={pathname?.startsWith("/dashboard/admin/settings/monitoring")} />
                      <NavItem icon={MessageSquare} label="Notifications" href="/dashboard/admin/notifications" active={pathname?.startsWith("/dashboard/admin/notifications")} />
                    </NavGroup>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main content area renders the child page */}
            <div className="col-span-12 md:col-span-9 lg:col-span-7">
              {children}
            </div>

            {/* Right sidebar hosts dynamic rail content */}
            <div className="col-span-12 lg:col-span-3">
              <RightRailSlot />
            </div>
          </div>
        </div>
      </AdminRightRailProvider>
    </MockRoleGuard>
  )
}

function NavItem({ icon: Icon, label, href, active }: { icon: any; label: string; href?: string; active?: boolean }) {
  const btn = (
    <Button
      variant="ghost"
      className={`w-full justify-start max-w-full overflow-hidden text-ellipsis whitespace-nowrap ${active ? "bg-slate-800/70 text-cyan-400" : "text-slate-400 hover:text-slate-100"}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      <span className="truncate">{label}</span>
    </Button>
  )
  if (href) return <Link href={href}>{btn}</Link>
  return btn
}

function NavGroup({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  const storageKey = `admin_nav_group_${id}`
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    try {
      const v = localStorage.getItem(storageKey)
      return v ? v === '1' : true
    } catch { return true }
  })
  useEffect(() => {
    try { localStorage.setItem(storageKey, open ? '1' : '0') } catch {}
  }, [open])

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-2 mt-3 text-xs tracking-wide text-slate-500 hover:text-slate-300"
        aria-expanded={open}
      >
        <span className="select-none">{label}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pl-3 space-y-1 overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
