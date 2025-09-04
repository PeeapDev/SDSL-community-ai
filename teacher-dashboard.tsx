"use client"

import { useEffect, useRef, useState, type ComponentProps } from "react"
import {
  Activity,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ClipboardList,
  Download,
  GraduationCap,
  Hexagon,
  Mic,
  Moon,
  Search,
  Send,
  Settings,
  Shield,
  Sun,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { getProfile } from "@/lib/profileStore"
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function TeacherDashboard() {
  const { userId, signOut } = useMockAuth()
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [activeClasses, setActiveClasses] = useState(5)
  const [toGrade, setToGrade] = useState(12)
  const [engagement, setEngagement] = useState(86)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [menuOpen, setMenuOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(true)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const i = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(i)
  }, [])

  // Load profile avatar
  useEffect(() => {
    if (!userId) return
    try {
      const p = getProfile(userId)
      setAvatarUrl(p.avatarUrl)
    } catch {}
  }, [userId])

  // Background particles (non-null captured refs)
  useEffect(() => {
    const c = canvasRef.current
    if (!c) return
    const context = c.getContext("2d")
    if (!context) return
    const canvas = c as HTMLCanvasElement
    const ctx2 = context as CanvasRenderingContext2D
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    class P {
      x = Math.random() * canvas.width
      y = Math.random() * canvas.height
      s = Math.random() * 2 + 1
      vx = (Math.random() - 0.5) * 0.4
      vy = (Math.random() - 0.5) * 0.4
      c = `rgba(${Math.floor(Math.random() * 80) + 120}, ${Math.floor(Math.random() * 80) + 120}, ${Math.floor(Math.random() * 80) + 200}, ${Math.random() * 0.4 + 0.1})`
      u() {
        this.x += this.vx
        this.y += this.vy
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }
      d() {
        ctx2.fillStyle = this.c
        ctx2.beginPath()
        ctx2.arc(this.x, this.y, this.s, 0, Math.PI * 2)
        ctx2.fill()
      }
    }
    const ps = Array.from({ length: 80 }, () => new P())
    const loop = () => {
      ctx2.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of ps) {
        p.u()
        p.d()
      }
      requestAnimationFrame(loop)
    }
    loop()
    const onR = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    window.addEventListener("resize", onR)
    return () => window.removeEventListener("resize", onR)
  }, [])

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"))
  const formatTime = (d: Date) => d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const formatDate = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  return (
    <div className={`${theme} min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />
      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Campus AI Teacher</span>
          </div>
          <div className="flex items-center space-x-6 relative">
            <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search classes, activities, students..." className="bg-transparent border-none focus:outline-none text-sm w-56 placeholder:text-slate-500" />
            </div>
            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/notifications">
                      <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></span>
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-slate-400 hover:text-slate-100">
                      {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle theme</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <button onClick={()=>setMenuOpen(v=>!v)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-600">
                <Avatar>
                  <AvatarImage src={avatarUrl || "/placeholder-user.jpg"} alt="Teacher" />
                  <AvatarFallback className="bg-slate-700 text-cyan-500">T</AvatarFallback>
                </Avatar>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-slate-900 border border-slate-800 rounded-md shadow-lg z-50">
                  <Link href="/profile/settings" className="block px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Profile Settings</Link>
                  <button onClick={()=>{setMenuOpen(false); signOut()}} className="w-full text-left px-3 py-2 text-sm text-rose-300 hover:bg-slate-800">Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <NavItem icon={Activity} label="Overview" active />
                  <NavItem icon={BookOpen} label="Community" href="/dashboard/admin/community/feed" />
                  <NavItem icon={Send} label="Chat" href="/dashboard/admin/community/messages" />
                  <NavItem icon={BookOpen} label="My Classes" />
                  <NavItem icon={ClipboardList} label="Assignments" />
                  <NavItem icon={GraduationCap} label="Grades" />
                  <NavItem icon={Users} label="Students" />
                  <NavItem icon={Settings} label="Settings" />
                  {/* Wallet group */}
                  <div className="pt-2 border-t border-slate-700/40" />
                  <button
                    onClick={()=> setWalletOpen(o=>!o)}
                    className="w-full text-left text-slate-300 hover:text-white text-sm px-2 py-1.5 rounded hover:bg-slate-800/60"
                  >
                    Wallet
                  </button>
                  {walletOpen && (
                    <div className="ml-2 space-y-1">
                      <Link href="/dashboard/teacher/wallet" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Overview</Link>
                      <Link href="/dashboard/teacher/wallet?tab=send" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Send</Link>
                      <Link href="/dashboard/teacher/wallet?tab=receive" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Receive</Link>
                      <Link href="/dashboard/teacher/wallet?tab=transactions" className="block text-sm text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-slate-800/60">Transactions</Link>
                    </div>
                  )}
                </nav>
                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <div className="text-xs text-slate-500 mb-2 font-mono">CLASSROOM STATUS</div>
                  <div className="space-y-3">
                    <StatusItem label="Active Classes" value={Math.min(activeClasses * 20, 100)} color="cyan" />
                    <StatusItem label="To Grade" value={Math.min(toGrade * 7, 100)} color="purple" />
                    <StatusItem label="Engagement" value={engagement} color="green" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main */}
          <div className="col-span-12 md:col-span-9 lg:col-span-7">
            <div className="grid gap-6">
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-slate-700/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                      Teaching Overview
                    </CardTitle>
                    <Badge variant="outline" className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs">
                      LIVE
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard title="Active Classes" value={Math.min(activeClasses * 20, 100)} icon={BookOpen} detail="This term" />
                    <MetricCard title="Assignments to Grade" value={Math.min(toGrade * 7, 100)} icon={ClipboardList} detail="Pending" />
                    <MetricCard title="Student Engagement" value={engagement} icon={Users} detail="Avg." />
                  </div>
                  <div className="mt-8">
                    <Tabs defaultValue="progress" className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <TabsList className="bg-slate-800/50 p-1">
                          <TabsTrigger value="progress" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">Progress</TabsTrigger>
                          <TabsTrigger value="submissions" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">Submissions</TabsTrigger>
                          <TabsTrigger value="resources" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">Resources</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <div className="flex items-center"><div className="h-2 w-2 rounded-full bg-cyan-500 mr-1"></div> Classes</div>
                          <div className="flex items-center"><div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div> Assignments</div>
                          <div className="flex items-center"><div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div> Engagement</div>
                        </div>
                      </div>
                      <TabsContent value="progress" className="mt-0">
                        <div className="h-64 w-full relative bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
                          <MiniBars />
                          <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-md px-3 py-2 border border-slate-700/50">
                            <div className="text-xs text-slate-400">Avg Engagement</div>
                            <div className="text-lg font-mono text-cyan-400">{engagement}%</div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="submissions" className="mt-0">
                        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
                          <div className="grid grid-cols-12 text-xs text-slate-400 p-3 border-b border-slate-700/50 bg-slate-800/50">
                            <div className="col-span-1">ID</div>
                            <div className="col-span-4">Submission</div>
                            <div className="col-span-2">Student</div>
                            <div className="col-span-2">Due</div>
                            <div className="col-span-2">Score</div>
                            <div className="col-span-1">Status</div>
                          </div>
                          <div className="divide-y divide-slate-700/30">
                            <Row pid="A-101" name="Essay: AI Ethics" user="Alex" status="submitted" />
                            <Row pid="A-102" name="Quiz: Algebra" user="Brooke" status="missing" />
                            <Row pid="A-103" name="Project: Solar" user="Chris" status="graded" />
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="resources" className="mt-0">
                        <Card className="bg-slate-800/30 border-slate-700/50">
                          <CardContent className="p-4 text-sm text-slate-400">Upload and organize teaching resources here (coming soon).</CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-100 flex items-center text-base"><GraduationCap className="mr-2 h-5 w-5 text-green-500" />Class Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <ProgressRow label="Class 10A" value={84} />
                      <ProgressRow label="Physics 201" value={72} />
                      <ProgressRow label="Algebra II" value={63} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center text-base"><Calendar className="mr-2 h-5 w-5 text-blue-500" />Upcoming</CardTitle>
                    <Badge variant="outline" className="bg-slate-800/50 text-blue-400 border-blue-500/50">3 Items</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between"><span className="text-slate-300">Quiz: Chapter 4</span><span className="text-slate-500">Fri</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-300">Assignment: Lab Report</span><span className="text-slate-500">Mon</span></div>
                      <div className="flex items-center justify-between"><span className="text-slate-300">Parent Emails</span><span className="text-slate-500">Wed</span></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-slate-100 flex items-center text-base"><Send className="mr-2 h-5 w-5 text-blue-500" />Announcements</CardTitle>
                  <Badge variant="outline" className="bg-slate-800/50 text-blue-400 border-blue-500/50">New</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <MessageItem sender="Student Council" time="15:20" message="School fair this weekend." avatar="/placeholder.svg?height=40&width=40" />
                    <MessageItem sender="Admin" time="08:40" message="Grades export tool updated." avatar="/placeholder.svg?height=40&width=40" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-700/50 pt-4">
                  <div className="flex items-center w-full space-x-2">
                    <input type="text" placeholder="Type an announcement..." className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    <Button size="icon" className="bg-blue-600 hover:bg-blue-700"><Mic className="h-4 w-4" /></Button>
                    <Button size="icon" className="bg-cyan-600 hover:bg-cyan-700"><Send className="h-4 w-4" /></Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="col-span-12 lg:col-span-3">
            <div className="grid gap-6">
              {/* Wallet balance */}
              <WalletBalanceCard userId={userId ?? undefined} />
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 border-b border-slate-700/50">
                    <div className="text-center">
                      <div className="text-xs text-slate-500 mb-1 font-mono">SYSTEM TIME</div>
                      <div className="text-3xl font-mono text-cyan-400 mb-1">{formatTime(currentTime)}</div>
                      <div className="text-sm text-slate-400">{formatDate(currentTime)}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1">Attendance</div>
                        <div className="text-sm font-mono text-slate-200">96%</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1">Wi‑Fi</div>
                        <div className="text-sm font-mono text-slate-200 flex items-center"><Wifi className="h-3 w-3 mr-1" /> Good</div>
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
                    <ActionButton icon={ClipboardList} label="Create Assignment" />
                    <ActionButton icon={BookOpen} label="New Activity" />
                    <ActionButton icon={GraduationCap} label="Grade Submissions" />
                    <ActionButton icon={Send} label="Message Class" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-100 text-base">Class Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ToggleRow label="Accept Late Submissions" />
                    <ToggleRow label="Enable AI Assist" defaultChecked />
                    <ToggleRow label="Publish Grades" />
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

function NavItem({ icon: Icon, label, active, href }: { icon: LucideIcon; label: string; active?: boolean; href?: string }) {
  const inner = (
    <Button
      variant="ghost"
      className={`w-full justify-start ${active ? "bg-slate-800/70 text-cyan-400" : "text-slate-400 hover:text-slate-100"}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}

function StatusItem({ label, value, color }: { label: string; value: number; color: "cyan" | "purple" | "green" }) {
  const colors = {
    cyan: "from-cyan-500 to-blue-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
  } as const
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-xs text-slate-400">{value}%</div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${colors[color]} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, detail }: { title: string; value: number; icon: LucideIcon; detail: string }) {
  return (
    <div className={`bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">{value}%</div>
      <div className="text-xs text-slate-500">{detail}</div>
    </div>
  )
}

function MiniBars() {
  return (
    <div className="h-full w-full flex items-end justify-between px-4 pt-4 pb-8 relative">
      <div className="absolute left-0 right-0 top-0 h-full flex flex-col justify-between py-4 px-10">
        <div className="border-b border-slate-700/30 w-full"></div>
        <div className="border-b border-slate-700/30 w-full"></div>
        <div className="border-b border-slate-700/30 w-full"></div>
        <div className="border-b border-slate-700/30 w-full"></div>
        <div className="border-b border-slate-700/30 w-full"></div>
      </div>
      <div className="flex-1 h-full flex items-end justify-between px-2 z-10">
        {Array.from({ length: 24 }).map((_, i) => {
          const a = Math.floor(Math.random() * 60) + 20
          const b = Math.floor(Math.random() * 40) + 40
          const c = Math.floor(Math.random() * 30) + 30
          return (
            <div key={i} className="flex space-x-0.5">
              <div className="w-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-sm" style={{ height: `${a}%` }}></div>
              <div className="w-1 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm" style={{ height: `${b}%` }}></div>
              <div className="w-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm" style={{ height: `${c}%` }}></div>
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
        <div className="text-xs text-slate-500">Mon</div>
        <div className="text-xs text-slate-500">Tue</div>
        <div className="text-xs text-slate-500">Wed</div>
        <div className="text-xs text-slate-500">Thu</div>
        <div className="text-xs text-slate-500">Fri</div>
      </div>
    </div>
  )
}

function Row({ pid, name, user, status }: { pid: string; name: string; user: string; status: string }) {
  return (
    <div className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-slate-800/50">
      <div className="col-span-1 text-slate-500">{pid}</div>
      <div className="col-span-4 text-slate-300">{name}</div>
      <div className="col-span-2 text-slate-400">{user}</div>
      <div className="col-span-2 text-slate-400">—</div>
      <div className="col-span-2 text-slate-400">—</div>
      <div className="col-span-1">
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">{status}</Badge>
      </div>
    </div>
  )
}

function ProgressRow({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-slate-300">{label}</div>
        <div className="text-xs text-cyan-400 font-mono">{value}%</div>
      </div>
      <Progress value={value} className="h-2 bg-slate-700">
        <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${value}%` }} />
      </Progress>
    </div>
  )
}

function MessageItem({ sender, time, message, avatar }: { sender: string; time: string; message: string; avatar: string }) {
  return (
    <div className={`flex space-x-3 p-2 rounded-md`}>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar} alt={sender} />
        <AvatarFallback className="bg-slate-700 text-cyan-500">{sender.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-slate-200">{sender}</div>
          <div className="text-xs text-slate-500">{time}</div>
        </div>
        <div className="text-xs text-slate-400 mt-1">{message}</div>
      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <Button variant="outline" className="h-auto py-3 px-3 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 flex flex-col items-center justify-center space-y-1 w-full">
      <Icon className="h-5 w-5 text-cyan-500" />
      <span className="text-xs">{label}</span>
    </Button>
  )
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Label className="text-sm text-slate-400">{label}</Label>
      <Switch defaultChecked={defaultChecked} />
    </div>
  )
}

function Info(props: ComponentProps<typeof Shield>) {
  return <Shield {...props} />
}
