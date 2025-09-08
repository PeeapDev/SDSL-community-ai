"use client"

import React, { useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Hexagon, Search, BookOpen, MessageSquare, Users, Settings, Wallet as WalletIcon, CreditCard, Command, Globe, Database, Shield, Terminal, RefreshCw, Download, Moon, Sun, Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { userId, role } = useMockAuth()

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    const DPR = window.devicePixelRatio || 1
    const resize = () => {
      c.width = Math.floor(c.clientWidth * DPR)
      c.height = Math.floor(c.clientHeight * DPR)
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
    }
    resize()
    let raf = 0
    const tick = () => { ctx.clearRect(0,0,c.clientWidth,c.clientHeight); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    const onResize = () => resize()
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [])

  // If we are on the root student dashboard, render the original page as-is
  if (pathname === "/dashboard/student") return <>{children}</>

  // Otherwise, render the student chrome and place the page in the middle column
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
      <div className="container mx-auto p-4 relative z-10">
        {/* Header copied to match overview */}
        <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Campus AI</span>
          </div>
          <div className="flex items-center space-x-6 relative">
            <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search courses, activities..." className="bg-transparent border-none focus:outline-none text-sm w-40 placeholder:text-slate-500" />
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></span>
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-100">
                <Moon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* 12-col grid with left, middle, right matching overview */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left sidebar (match items) */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <NavItem icon={Command} label="Dashboard" href="/dashboard/student" active={pathname === "/dashboard/student"} />
                  <NavItem icon={Globe} label="Community" href="/dashboard/student/community" active={pathname?.startsWith("/dashboard/student/community")} />
                  <NavItem icon={MessageSquare} label="Chat" href="/dashboard/student/chat" active={pathname?.startsWith("/dashboard/student/chat")} />
                  <NavItem icon={Database} label="Classes" href="/dashboard/student/classes" active={pathname?.startsWith("/dashboard/student/classes")} />
                  <NavItem icon={Globe} label="Activities" href="/dashboard/student/activities" active={pathname?.startsWith("/dashboard/student/activities")} />
                  <NavItem icon={Shield} label="Assignments" href="/dashboard/student/assignments" active={pathname?.startsWith("/dashboard/student/assignments")} />
                  <NavItem icon={Terminal} label="Grades" href="/dashboard/student/grades" active={pathname?.startsWith("/dashboard/student/grades")} />
                  <NavItem icon={Settings} label="Settings" href="/dashboard/student/settings" active={pathname?.startsWith("/dashboard/student/settings")} />
                  <div className="pt-2 border-t border-slate-700/40" />
                  <div className="mt-1 text-xs text-slate-500">Wallet</div>
                  <Link href="/dashboard/student/wallet" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Overview</Link>
                  <Link href="/dashboard/student/wallet?tab=send" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Send</Link>
                  <Link href="/dashboard/student/wallet?tab=receive" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Receive</Link>
                  <Link href="/dashboard/student/wallet?tab=transactions" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Transactions</Link>
                  <Link href="/dashboard/student/card" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Card</Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Middle content slot */}
          <div id="student-middle-slot" className="col-span-12 md:col-span-9 lg:col-span-7">
            {children}
          </div>

          {/* Right sidebar copied from overview */}
          <div className="col-span-12 lg:col-span-3">
            <div className="grid gap-6">
              {role === "student" && (
                <WalletBalanceCard userId={userId ?? undefined} />
              )}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border-b border-slate-700/50">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1 font-mono">SYSTEM TIME</div>
                      <div className="text-3xl font-mono text-cyan-400 mb-1">--:--:--</div>
                      <div className="text-sm text-slate-400">Today</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1">Uptime</div>
                        <div className="text-sm font-mono text-slate-200">—</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1">Time Zone</div>
                        <div className="text-sm font-mono text-slate-200">—</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-100 text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton icon={Shield} label="Security Scan" />
                    <ActionButton icon={RefreshCw} label="Sync Data" />
                    <ActionButton icon={Download} label="Backup" />
                    <ActionButton icon={Terminal} label="Console" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
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

function ActionButton({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <button className="flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700/50 rounded-md px-3 py-2 text-sm">
      <Icon className="h-4 w-4 text-cyan-400" />
      <span className="truncate">{label}</span>
    </button>
  )
}
