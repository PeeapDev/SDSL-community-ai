"use client"

import React from "react"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { getAllUsers } from "@/lib/mockUsers"
import { listPosts } from "@/lib/communityStore"
import { useAdminRightRail } from "@/components/layouts/AdminRightRail"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"

const COLORS = ["#06b6d4", "#ef4444", "#8b5cf6", "#22c55e"]

export default function AdminUsersTeachersPage() {
  const teachers = useMemo(()=> getAllUsers().filter(u => u.role === "teacher"), [])
  const posts = useMemo(()=> listPosts().filter(p=>p.authorRole === "teacher"), [])
  const { setContent, clear } = useAdminRightRail()

  useEffect(() => {
    const males = teachers.filter(t=>/^mr\b/i.test(t.displayName)).length
    const females = teachers.filter(t=>/^(ms|mrs)\b/i.test(t.displayName)).length
    const unknown = teachers.length - males - females
    const chartData = [
      { name: "Female", value: females },
      { name: "Male", value: males },
      { name: "Unknown", value: unknown },
    ]
    // compute 7-day posts sparkline (mock, using createdAt)
    const now = Date.now()
    const byDay = Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(now - (6 - i) * 86400000)
      const dayEnd = new Date(now - (5 - i) * 86400000)
      const c = listPosts().filter(p => p.authorRole === "teacher" && new Date(p.createdAt) >= dayStart && new Date(p.createdAt) < dayEnd).length
      return c
    })

    setContent(
      <div className="space-y-4">
        {/* KPIs */}
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm">Teachers • Overview</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              className="grid grid-cols-3 gap-2"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            >
              <KpiMotion><Kpi title="Total" value={teachers.length} /></KpiMotion>
              <KpiMotion><Kpi title="Posts" value={posts.length} /></KpiMotion>
              <KpiMotion><Kpi title="Active" value={teachers.length} /></KpiMotion>
            </motion.div>
            {/* Animated donut + legend */}
            <motion.div className="flex items-center gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 120, damping: 16 }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 120, damping: 12 }}>
                <AnimatedDonut females={females} males={males} unknown={unknown} />
              </motion.div>
              <motion.div className="space-y-1 text-xs text-slate-400" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}>
                <LegendMotion><LegendDot color="#06b6d4" label="Female" value={females} /></LegendMotion>
                <LegendMotion><LegendDot color="#ef4444" label="Male" value={males} /></LegendMotion>
                <LegendMotion><LegendDot color="#8b5cf6" label="Unknown" value={unknown} /></LegendMotion>
              </motion.div>
            </motion.div>
            {/* Sparkline */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-xs text-slate-400">
              <div className="mb-1">Posts last 7 days</div>
              <Sparkline values={byDay} />
            </motion.div>
            {/* Top contributors */}
            {(() => {
              const counts = new Map<string, number>()
              listPosts().filter(p=>p.authorRole==="teacher").forEach(p=>{
                counts.set(p.authorId, (counts.get(p.authorId)||0)+1)
              })
              const sorted = Array.from(counts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,3)
              return (
                <div>
                  <div className="text-xs text-slate-400 mb-2">Top contributors</div>
                  <motion.ul initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} className="space-y-2">
                    {sorted.map(([uid, c], i)=> (
                      <LegendMotion key={uid}>
                        <li className="flex items-center gap-2 text-sm">
                          <img src={getAllUsers().find(u=>u.id===uid)?.avatarUrl||"/placeholder-user.jpg"} className="h-6 w-6 rounded-full object-cover" />
                          <span className="flex-1 truncate">{getAllUsers().find(u=>u.id===uid)?.displayName||uid}</span>
                          <span className="text-xs text-slate-500">{c}</span>
                        </li>
                      </LegendMotion>
                    ))}
                    {sorted.length===0 && <li className="text-xs text-slate-500">No posts yet.</li>}
                  </motion.ul>
                </div>
              )
            })()}
            <div className="flex gap-2 pt-1">
              <a href="/dashboard/admin/analytics/teachers" className="px-2 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800">Open Analytics</a>
              <a href="/dashboard/admin/community/feed" className="px-2 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800">View Posts</a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
    return () => clear()
  }, [teachers, posts, setContent, clear])

  return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">User Management — Teachers</h1>
        <p className="text-slate-400 mt-2">Demo list of teachers with usernames and avatars (mock directory).</p>
        <div className="mt-6 bg-slate-900/50 border border-slate-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/70 text-slate-400">
              <tr>
                <th className="text-left px-4 py-2">User</th>
                <th className="text-left px-4 py-2">Username</th>
                <th className="text-left px-4 py-2">Role</th>
                <th className="text-left px-4 py-2">School</th>
                <th className="text-left px-4 py-2">Wallet</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => (
                <tr key={t.id} className="border-t border-slate-800">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <img src={t.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <div className="text-slate-200">{t.displayName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-400">@{t.username}</td>
                  <td className="px-4 py-2 capitalize">{t.role}</td>
                  <td className="px-4 py-2">{t.schoolId ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-400">Active</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/admin/users/teachers/${t.id}`} className="px-2 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800">View</Link>
                      <Link href={`/dashboard/admin/settings/wallet?userId=${t.id}`} className="px-2 py-1 text-xs rounded border border-cyan-700 text-cyan-300 hover:bg-cyan-900/30">Manage Wallet</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No demo teachers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
  )
}

// Small animated KPI counter
function Kpi({ title, value }: { title: string; value: number }) {
  const [n, setN] = React.useState(0)
  React.useEffect(() => {
    const start = performance.now()
    const dur = 600
    const from = 0
    const to = value
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur)
      setN(Math.round(from + (to - from) * (1 - Math.cos(p * Math.PI)) / 2))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return (
    <div className="rounded-md border border-slate-700/50 bg-slate-950/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{title}</div>
      <div className="text-slate-200 text-lg font-semibold">{n}</div>
    </div>
  )
}

function LegendDot({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
      <span className="text-slate-500">{value}</span>
    </div>
  )
}

function AnimatedDonut({ females, males, unknown }: { females: number; males: number; unknown: number }) {
  const total = Math.max(1, females + males + unknown)
  const arcs = [
    { val: females, color: "#06b6d4" },
    { val: males, color: "#ef4444" },
    { val: unknown, color: "#8b5cf6" },
  ]
  // compute dash array segments
  let acc = 0
  const segments = arcs.map(a => {
    const frac = a.val / total
    const start = acc
    acc += frac
    return { start, end: acc, color: a.color }
  })
  const R = 28
  const C = 2 * Math.PI * R
  return (
    <svg width={80} height={80} viewBox="0 0 80 80" className="shrink-0">
      <g transform="translate(40,40)">
        <circle r={R} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={10} />
        {segments.map((s, i) => {
          const len = (s.end - s.start) * C
          const offset = C * (1 - s.start)
          return (
            <circle
              key={i}
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={10}
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dasharray 800ms ease" }}
            />
          )
        })}
      </g>
    </svg>
  )
}

// Tiny sparkline SVG with animated stroke
function Sparkline({ values }: { values: number[] }) {
  const w = 140
  const h = 40
  const max = Math.max(1, ...values)
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 6) + 3
      const y = h - 6 - (v / max) * (h - 12)
      return `${x},${y}`
    })
    .join(" ")
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <rect x={0} y={0} width={w} height={h} rx={6} fill="rgba(2,6,23,0.6)" />
      <polyline
        points={pts}
        fill="none"
        stroke="#22c55e"
        strokeWidth={2}
        style={{ strokeDasharray: 400, strokeDashoffset: 400, animation: "dash 900ms ease forwards" as any }}
      />
      <style>{`@keyframes dash{to{stroke-dashoffset:0}}`}</style>
    </svg>
  )
}

// Motion wrappers used for staggered reveals
function KpiMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
      {children}
    </motion.div>
  )
}

function LegendMotion({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }}>
      {children}
    </motion.div>
  )
}
