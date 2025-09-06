"use client"

import { useEffect, useState, useRef, type ComponentProps } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Activity,
  AlertCircle,
  BarChart3,
  Bell,
  CircleOff,
  Command,
  Cpu,
  Database,
  DollarSign,
  Download,
  Globe,
  HardDrive,
  Hexagon,
  PieChart,
  LineChart,
  Lock,
  type LucideIcon,
  MessageSquare,
  Mail,
  Mic,
  Moon,
  Radio,
  RefreshCw,
  Search,
  Settings,
  Shield,
  Sun,
  Terminal,
  Wifi,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard"

export default function AdminDashboard() {
  const router = useRouter()
  const { userId, signOut } = useMockAuth()
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [systemStatus, setSystemStatus] = useState(92)
  const [cpuUsage, setCpuUsage] = useState(78)
  const [memoryUsage, setMemoryUsage] = useState(64)
  const [networkStatus, setNetworkStatus] = useState(99)
  const [securityLevel, setSecurityLevel] = useState(88)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const c = canvasRef.current
    if (!c) return

    const context = c.getContext("2d")
    if (!context) return

    const canvas = c as HTMLCanvasElement
    const ctx2 = context as CanvasRenderingContext2D

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const particles: Particle[] = []
    const particleCount = 80

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 0.4
        this.speedY = (Math.random() - 0.5) * 0.4
        this.color = `rgba(${Math.floor(Math.random() * 80) + 120}, ${Math.floor(Math.random() * 80) + 120}, ${Math.floor(
          Math.random() * 80
        ) + 200}, ${Math.random() * 0.4 + 0.1})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x > canvas.width) this.x = 0
        if (this.x < 0) this.x = canvas.width
        if (this.y > canvas.height) this.y = 0
        if (this.y < 0) this.y = canvas.height
      }

      draw() {
        ctx2.fillStyle = this.color
        ctx2.beginPath()
        ctx2.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx2.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle())

    function animate() {
      ctx2.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        p.update()
        p.draw()
      }
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
  const formatDate = (date: Date) => date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })

  return (
    <div className={`${theme} min-h-screen bg-gradient-to-br from-black to-slate-900 text-slate-100 relative overflow-hidden`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />

      <div className="container mx-auto p-4 relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between py-4 border-b border-slate-700/50 mb-6">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-cyan-500" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Campus AI Admin
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-1 bg-slate-800/50 rounded-full px-3 py-1.5 border border-slate-700/50 backdrop-blur-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search users, classes, reports..." className="bg-transparent border-none focus:outline-none text-sm w-56 placeholder:text-slate-500" />
            </div>

            <div className="flex items-center space-x-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative text-slate-400 hover:text-slate-100">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -top-1 -right-1 h-2 w-2 bg-cyan-500 rounded-full animate-pulse"></span>
                    </Button>
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

              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
                <AvatarFallback className="bg-slate-700 text-cyan-500">AD</AvatarFallback>
              </Avatar>
              <Button variant="outline" size="sm" className="h-8 border-slate-700/60" onClick={() => { signOut(); router.replace("/signin") }}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3 lg:col-span-2">
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm h-full">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <NavItem icon={Command} label="Overview" href="/dashboard/admin" active />
                  {/* User Management */}
                  <NavGroup label="User Management" defaultOpen>
                    <NavItem icon={Database} label="Schools" href="/dashboard/admin/users/schools" />
                    <NavItem icon={Database} label="Teachers" href="/dashboard/admin/users/teachers" />
                    <NavItem icon={Database} label="Students" href="/dashboard/admin/users/students" />
                    <NavItem icon={Database} label="Support Staff" href="/dashboard/admin/users/support" />
                    <NavItem icon={Database} label="Roles & Permissions" href="/dashboard/admin/users/roles" />
                  </NavGroup>
                  {/* Content & Activities */}
                  <NavGroup label="Content & Activities">
                    <NavItem icon={Terminal} label="AI Activities" href="/dashboard/admin/content/ai-activities" />
                    <NavItem icon={Terminal} label="Templates" href="/dashboard/admin/content/templates" />
                    <NavItem icon={Terminal} label="Assignments & Lessons" href="/dashboard/admin/content/assignments" />
                    <NavItem icon={Terminal} label="Content Library" href="/dashboard/admin/content/library" />
                  </NavGroup>
                  {/* AI Management */}
                  <NavGroup label="AI Management">
                    <NavItem icon={Radio} label="Prompt Templates" href="/dashboard/admin/ai/prompts" />
                    <NavItem icon={Radio} label="Image Generation" href="/dashboard/admin/ai/images" />
                    <NavItem icon={Radio} label="Agent Settings" href="/dashboard/admin/ai/agent" />
                    <NavItem icon={Radio} label="Usage Logs" href="/dashboard/admin/ai/logs" />
                  </NavGroup>
                  {/* School Management */}
                  <NavGroup label="School Management">
                    <NavItem icon={Globe} label="Classes & Subjects" href="/dashboard/admin/classes" />
                    <NavItem icon={Globe} label="Timetables" href="/dashboard/admin/school/timetables" />
                    <NavItem icon={Globe} label="Attendance" href="/dashboard/admin/school/attendance" />
                    <NavItem icon={Globe} label="Assessments & Grading" href="/dashboard/admin/school/assessments" />
                  </NavGroup>
                  {/* Analytics & Reports */}
                  <NavGroup label="Analytics & Reports">
                    <NavItem icon={Terminal} label="Reports" href="/dashboard/admin/reports" />
                    <NavItem icon={Terminal} label="Student Trends" href="/dashboard/admin/analytics/students" />
                    <NavItem icon={Terminal} label="Teacher Usage" href="/dashboard/admin/analytics/teachers" />
                    <NavItem icon={Terminal} label="School-wide Reports" href="/dashboard/admin/analytics/schools" />
                    <NavItem icon={Terminal} label="AI Efficiency" href="/dashboard/admin/analytics/ai-efficiency" />
                  </NavGroup>
                  {/* Finance */}
                  <NavGroup label="Finance">
                    <NavItem icon={DollarSign} label="Deposit" href="/dashboard/admin/finance/deposit" />
                    <NavItem icon={DollarSign} label="Withdraw" href="/dashboard/admin/finance/withdraw" />
                    <NavItem icon={Lock} label="Card" href="/dashboard/admin/finance/card" />
                    <NavItem icon={PieChart} label="Profit" href="/dashboard/admin/finance/profit" />
                    <NavItem icon={BarChart3} label="Transactions" href="/dashboard/admin/finance/transactions" />
                  </NavGroup>
                  {/* Community */}
                  <NavGroup label="Community">
                    <NavItem icon={MessageSquare} label="Feed" href="/dashboard/admin/community/feed" />
                    <NavItem icon={MessageSquare} label="Messages" href="/dashboard/admin/community/messages" />
                    <NavItem icon={MessageSquare} label="Friends" href="/dashboard/admin/community/friends" />
                    <NavItem icon={Settings} label="Community Settings" href="/dashboard/admin/community/settings" />
                    <NavItem icon={Shield} label="Moderation" href="/dashboard/admin/community/moderation" />
                  </NavGroup>
                  {/* System Settings */}
                  <NavGroup label="System Settings">
                    <NavItem icon={Settings} label="General" href="/dashboard/admin/settings/general" />
                    <NavItem icon={Mail} label="Email (SMTP)" href="/dashboard/admin/settings/email" />
                    <NavItem icon={Radio} label="AI & Integrations" href="/dashboard/admin/settings/ai" />
                    <NavItem icon={Terminal} label="Billing" href="/dashboard/admin/settings/billing" />
                    <NavItem icon={Terminal} label="API Keys" href="/dashboard/admin/settings/api" />
                    <NavItem icon={Terminal} label="Training" href="/dashboard/admin/settings/training" />
                    <NavItem icon={Shield} label="Security" href="/dashboard/admin/settings/security" />
                    <NavItem icon={Globe} label="Domains & Subdomains" href="/dashboard/admin/settings/domains" />
                    <NavItem icon={Wifi} label="System Monitoring" href="/dashboard/admin/settings/monitoring" />
                    <NavItem icon={MessageSquare} label="Notifications" href="/dashboard/admin/notifications" />
                  </NavGroup>
                  {/* Support & Helpdesk */}
                  <NavGroup label="Support & Helpdesk">
                    <NavItem icon={MessageSquare} label="Tickets" href="/dashboard/admin/support/tickets" />
                    <NavItem icon={MessageSquare} label="Knowledge Base" href="/dashboard/admin/support/kb" />
                    <NavItem icon={MessageSquare} label="Contact Logs" href="/dashboard/admin/support/contacts" />
                  </NavGroup>
                </nav>

                <div className="mt-8 pt-6 border-t border-slate-700/50">
                  <div className="text-xs text-slate-500 mb-2 font-mono">PLATFORM STATUS</div>
                  <div className="space-y-3">
                    <StatusItem label="Active Users" value={systemStatus} color="cyan" />
                    <StatusItem label="Content Health" value={securityLevel} color="green" />
                    <StatusItem label="Uptime" value={networkStatus} color="blue" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main dashboard */}
          <div className="col-span-12 md:col-span-9 lg:col-span-7">
            <div className="grid gap-6">
              {/* Overview */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="border-b border-slate-700/50 pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-slate-100 flex items-center">
                      <Activity className="mr-2 h-5 w-5 text-cyan-500" />
                      Admin Overview
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-slate-800/50 text-cyan-400 border-cyan-500/50 text-xs">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-500 mr-1 animate-pulse"></div>
                        LIVE
                      </Badge>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MetricCard title="Active Users" value={cpuUsage} icon={Cpu} trend="up" color="cyan" detail="Last 24h" />
                    <MetricCard title="Content Items" value={memoryUsage} icon={HardDrive} trend="stable" color="purple" detail="Total" />
                    <MetricCard title="System Uptime" value={networkStatus} icon={Wifi} trend="up" color="blue" detail="SLA" />
                  </div>

                  <div className="mt-8">
                    <Tabs defaultValue="performance" className="w-full">
                      <div className="flex items-center justify-between mb-4">
                        <TabsList className="bg-slate-800/50 p-1">
                          <TabsTrigger value="performance" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">
                            Usage
                          </TabsTrigger>
                          <TabsTrigger value="processes" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">
                            Incidents
                          </TabsTrigger>
                          <TabsTrigger value="storage" className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400">
                            Storage
                          </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-cyan-500 mr-1"></div>
                            Users
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-purple-500 mr-1"></div>
                            Content
                          </div>
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500 mr-1"></div>
                            Uptime
                          </div>
                        </div>
                      </div>

                      <TabsContent value="performance" className="mt-0">
                        <div className="h-64 w-full relative bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
                          <PerformanceChart />
                          <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-sm rounded-md px-3 py-2 border border-slate-700/50">
                            <div className="text-xs text-slate-400">Peak Usage</div>
                            <div className="text-lg font-mono text-cyan-400">{cpuUsage}%</div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="processes" className="mt-0">
                        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
                          <div className="grid grid-cols-12 text-xs text-slate-400 p-3 border-b border-slate-700/50 bg-slate-800/50">
                            <div className="col-span-1">ID</div>
                            <div className="col-span-4">Incident</div>
                            <div className="col-span-2">Severity</div>
                            <div className="col-span-2">Opened</div>
                            <div className="col-span-2">Owner</div>
                            <div className="col-span-1">Status</div>
                          </div>
                          {/* Demo rows reused */}
                          <div className="divide-y divide-slate-700/30">
                            <ProcessRow pid="1024" name="API Rate Spike" user="OPS" cpu={12.4} memory={345} status="open" />
                            <ProcessRow pid="1842" name="Login Errors" user="SRE" cpu={8.7} memory={128} status="monitoring" />
                            <ProcessRow pid="2156" name="Slow Queries" user="DBA" cpu={5.2} memory={96} status="open" />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="storage" className="mt-0">
                        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <StorageItem name="User Data" total={4096} used={1865} type="S3" />
                            <StorageItem name="Media" total={8192} used={4200} type="S3" />
                            <StorageItem name="Backups" total={16384} used={8200} type="S3" />
                            <StorageItem name="Logs" total={2048} used={1285} type="S3" />
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>

              {/* Security & Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-100 flex items-center text-base">
                      <Shield className="mr-2 h-5 w-5 text-green-500" />
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">Auth</div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">RLS Policies</div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Enforced</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">Incidents (24h)</div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/50">0</Badge>
                      </div>
                      <div className="pt-2 mt-2 border-t border-slate-700/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-medium">Risk Score</div>
                          <div className="text-sm text-cyan-400">{securityLevel}%</div>
                        </div>
                        <Progress value={securityLevel} className="h-2 bg-slate-700">
                          <div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full" style={{ width: `${securityLevel}%` }} />
                        </Progress>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-100 flex items-center text-base">
                      <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                      System Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <AlertItem title="Policy Update Applied" time="14:32:12" description="New RLS rules deployed" type="update" />
                      <AlertItem title="Scaling Event" time="13:45:06" description="Auto-scaled API workers" type="info" />
                      <AlertItem title="Backup Completed" time="04:30:00" description="Daily backup succeeded" type="success" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Communications */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-slate-100 flex items-center text-base">
                    <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
                    Announcements
                  </CardTitle>
                  <Badge variant="outline" className="bg-slate-800/50 text-blue-400 border-blue-500/50">
                    2 New Posts
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <CommunicationItem sender="Ops" time="15:42:12" message="Maintenance window scheduled 02:00 UTC." avatar="/placeholder.svg?height=40&width=40" unread />
                    <CommunicationItem sender="Security" time="12:15:33" message="No critical alerts in the last 24 hours." avatar="/placeholder.svg?height=40&width=40" />
                  </div>
                </CardContent>
                <CardFooter className="border-t border-slate-700/50 pt-4">
                  <div className="flex items-center w-full space-x-2">
                    <input type="text" placeholder="Type an announcement..." className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                    <Button size="icon" className="bg-blue-600 hover:bg-blue-700">
                      <Mic className="h-4 w-4" />
                    </Button>
                    <Button size="icon" className="bg-cyan-600 hover:bg-cyan-700">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
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
              {/* System time */}
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
                        <div className="text-xs text-slate-500 mb-1">Uptime</div>
                        <div className="text-sm font-mono text-slate-200">99.99%</div>
                      </div>
                      <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
                        <div className="text-xs text-slate-500 mb-1">Region</div>
                        <div className="text-sm font-mono text-slate-200">US-West</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick actions */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-100 text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <ActionButton icon={Shield} label="Review Policies" />
                    <ActionButton icon={RefreshCw} label="Sync Data" />
                    <ActionButton icon={Download} label="Export Report" />
                    <ActionButton icon={Terminal} label="Open Console" />
                  </div>
                </CardContent>
              </Card>

              {/* Environment controls */}
              <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-100 text-base">Admin Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Radio className="text-cyan-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-slate-400">Maintenance Mode</Label>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Lock className="text-cyan-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-slate-400">Require MFA</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap className="text-cyan-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-slate-400">Enable Autoscale</Label>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CircleOff className="text-cyan-500 mr-2 h-4 w-4" />
                        <Label className="text-sm text-slate-400">Lock New Signups</Label>
                      </div>
                      <Switch />
                    </div>
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

function NavItem({ icon: Icon, label, href, active }: { icon: LucideIcon; label: string; href?: string; active?: boolean }) {
  const btn = (
    <Button
      variant="ghost"
      className={`w-full justify-start ${active ? "bg-slate-800/70 text-cyan-400" : "text-slate-400 hover:text-slate-100"}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
  if (href) return <Link href={href}>{btn}</Link>
  return btn
}

function NavGroup({ label, defaultOpen, children }: { label: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState<boolean>(!!defaultOpen)
  return (
    <div className="space-y-1">
      <Button
        variant="ghost"
        className="w-full justify-between text-slate-400 hover:text-slate-100"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-sm">{label}</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>
      {open && <div className="pl-3 space-y-1">{children}</div>}
    </div>
  )
}

function StatusItem({ label, value, color }: { label: string; value: number; color: string }) {
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500"
      case "green":
        return "from-green-500 to-emerald-500"
      case "blue":
        return "from-blue-500 to-indigo-500"
      case "purple":
        return "from-purple-500 to-pink-500"
      default:
        return "from-cyan-500 to-blue-500"
    }
  }
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-xs text-slate-400">{value}%</div>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${getColor()} rounded-full`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, trend, color, detail }: { title: string; value: number; icon: LucideIcon; trend: "up" | "down" | "stable"; color: string; detail: string }) {
  const getColor = () => {
    switch (color) {
      case "cyan":
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
      case "green":
        return "from-green-500 to-emerald-500 border-green-500/30"
      case "blue":
        return "from-blue-500 to-indigo-500 border-blue-500/30"
      case "purple":
        return "from-purple-500 to-pink-500 border-purple-500/30"
      default:
        return "from-cyan-500 to-blue-500 border-cyan-500/30"
    }
  }
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <BarChart3 className="h-4 w-4 text-amber-500" />
      case "down":
        return <BarChart3 className="h-4 w-4 rotate-180 text-green-500" />
      case "stable":
        return <LineChart className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }
  return (
    <div className={`bg-slate-800/50 rounded-lg border ${getColor()} p-4 relative overflow-hidden`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-400">{title}</div>
        {/* icon color via className is not fully dynamic-safe in Tailwind; acceptable for demo */}
        <Icon className={`h-5 w-5`} />
      </div>
      <div className="text-2xl font-bold mb-1 bg-gradient-to-r bg-clip-text text-transparent from-slate-100 to-slate-300">{value}%</div>
      <div className="text-xs text-slate-500">{detail}</div>
      <div className="absolute bottom-2 right-2 flex items-center">{getTrendIcon()}</div>
      <div className="absolute -bottom-6 -right-6 h-16 w-16 rounded-full bg-gradient-to-r opacity-20 blur-xl from-cyan-500 to-blue-500"></div>
    </div>
  )
}

function PerformanceChart() {
  return (
    <div className="h-full w-full flex items-end justify-between px-4 pt-4 pb-8 relative">
      <div className="absolute left-2 top-0 h-full flex flex-col justify-between py-4">
        <div className="text-xs text-slate-500">100%</div>
        <div className="text-xs text-slate-500">75%</div>
        <div className="text-xs text-slate-500">50%</div>
        <div className="text-xs text-slate-500">25%</div>
        <div className="text-xs text-slate-500">0%</div>
      </div>
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
              <div className="w-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm" style={{ height: `${c}%` }}></div>
            </div>
          )
        })}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-10">
        <div className="text-xs text-slate-500">00:00</div>
        <div className="text-xs text-slate-500">06:00</div>
        <div className="text-xs text-slate-500">12:00</div>
        <div className="text-xs text-slate-500">18:00</div>
        <div className="text-xs text-slate-500">24:00</div>
      </div>
    </div>
  )
}

function ProcessRow({ pid, name, user, cpu, memory, status }: { pid: string; name: string; user: string; cpu: number; memory: number; status: string }) {
  return (
    <div className="grid grid-cols-12 py-2 px-3 text-sm hover:bg-slate-800/50">
      <div className="col-span-1 text-slate-500">{pid}</div>
      <div className="col-span-4 text-slate-300">{name}</div>
      <div className="col-span-2 text-slate-400">{user}</div>
      <div className="col-span-2 text-cyan-400">{cpu}%</div>
      <div className="col-span-2 text-purple-400">{memory} MB</div>
      <div className="col-span-1">
        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
          {status}
        </Badge>
      </div>
    </div>
  )
}

function StorageItem({ name, total, used, type }: { name: string; total: number; used: number; type: string }) {
  const percentage = Math.round((used / total) * 100)
  return (
    <div className="bg-slate-800/50 rounded-md p-3 border border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-300">{name}</div>
        <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600/50 text-xs">
          {type}
        </Badge>
      </div>
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <div className="text-xs text-slate-500">{used} GB / {total} GB</div>
          <div className="text-xs text-slate-400">{percentage}%</div>
        </div>
        <Progress value={percentage} className="h-1.5 bg-slate-700">
          <div className={`h-full rounded-full ${percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-amber-500" : "bg-cyan-500"}`} style={{ width: `${percentage}%` }} />
        </Progress>
      </div>
      <div className="flex items-center justify-between text-xs">
        <div className="text-slate-500">Free: {total - used} GB</div>
        <Button variant="ghost" size="sm" className="h-6 text-xs px-2 text-slate-400 hover:text-slate-100">Details</Button>
      </div>
    </div>
  )
}

function AlertItem({ title, time, description, type }: { title: string; time: string; description: string; type: "info" | "warning" | "error" | "success" | "update" }) {
  const getTypeStyles = () => {
    switch (type) {
      case "info":
        return { icon: Info, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
      case "warning":
        return { icon: AlertCircle, color: "text-amber-500 bg-amber-500/10 border-amber-500/30" }
      case "error":
        return { icon: AlertCircle, color: "text-red-500 bg-red-500/10 border-red-500/30" }
      case "success":
        return { icon: Check, color: "text-green-500 bg-green-500/10 border-green-500/30" }
      case "update":
        return { icon: Download, color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30" }
      default:
        return { icon: Info, color: "text-blue-500 bg-blue-500/10 border-blue-500/30" }
    }
  }
  const { icon: Icon, color } = getTypeStyles()
  return (
    <div className="flex items-start space-x-3">
      <div className={`mt-0.5 p-1 rounded-full ${color.split(" ")[1]} ${color.split(" ")[2]}`}>
        <Icon className={`h-3 w-3 ${color.split(" ")[0]}`} />
      </div>
      <div>
        <div className="flex items-center">
          <div className="text-sm font-medium text-slate-200">{title}</div>
          <div className="ml-2 text-xs text-slate-500">{time}</div>
        </div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
    </div>
  )
}

function CommunicationItem({ sender, time, message, avatar, unread }: { sender: string; time: string; message: string; avatar: string; unread?: boolean }) {
  return (
    <div className={`flex space-x-3 p-2 rounded-md ${unread ? "bg-slate-800/50 border border-slate-700/50" : ""}`}>
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
      {unread && (
        <div className="flex-shrink-0 self-center">
          <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
        </div>
      )}
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

function Info(props: ComponentProps<typeof AlertCircle>) {
  return <AlertCircle {...props} />
}
function Check(props: ComponentProps<typeof Shield>) {
  return <Shield {...props} />
}
