"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getUserById } from "@/lib/mockUsers"
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard"
import { useAdminRightRail } from "@/components/layouts/AdminRightRail"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { listPosts } from "@/lib/communityStore"

export default function AdminTeacherDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { setContent, clear } = useAdminRightRail()
  const id = params?.id as string
  const user = getUserById(id)

  useEffect(() => {
    if (!user || user.role !== "teacher") return
    const posts = listPosts().filter(p=>p.authorId === user.id)
    setContent(
      <motion.div className="space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-md">
          <CardHeader><CardTitle className="text-sm">Teacher • Stats</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-400">
            <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} className="space-y-1">
              <motion.div variants={{ hidden:{opacity:0,y:6}, show:{opacity:1,y:0} }}>User: <span className="text-slate-200">@{user.username}</span></motion.div>
              <motion.div variants={{ hidden:{opacity:0,y:6}, show:{opacity:1,y:0} }}>Role: <span className="text-slate-200">{user.role}</span></motion.div>
              <motion.div variants={{ hidden:{opacity:0,y:6}, show:{opacity:1,y:0} }}>School: <span className="text-slate-200">{user.schoolId ?? "—"}</span></motion.div>
              <motion.div variants={{ hidden:{opacity:0,y:6}, show:{opacity:1,y:0} }}>Posts: <span className="text-slate-200">{posts.length}</span></motion.div>
            </motion.div>
            {/* Progress bars */}
            <div className="pt-1 space-y-2">
              <div className="flex items-center justify-between text-xs"><span>Engagement</span><span className="text-slate-500">{Math.min(100, posts.length*7)}%</span></div>
              <div className="h-2 w-full rounded bg-slate-800 overflow-hidden">
                <motion.div className="h-full bg-cyan-500" initial={{ width: 0 }} animate={{ width: `${Math.min(100, posts.length*7)}%` }} transition={{ type:"spring", stiffness: 140, damping: 16 }} />
              </div>
              <div className="flex items-center justify-between text-xs"><span>Response Rate</span><span className="text-slate-500">{Math.min(100, 60 + posts.length*3)}%</span></div>
              <div className="h-2 w-full rounded bg-slate-800 overflow-hidden">
                <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${Math.min(100, 60 + posts.length*3)}%` }} transition={{ type:"spring", stiffness: 140, damping: 16, delay: 0.05 }} />
              </div>
            </div>
            <Link href={`/dashboard/admin/settings/wallet?userId=${user.id}`} className="inline-block mt-2 px-2 py-1 text-xs rounded border border-cyan-700 text-cyan-300 hover:bg-cyan-900/30">Open Wallet</Link>
          </CardContent>
        </Card>
      </motion.div>
    )
    return () => clear()
  }, [user, setContent, clear])

  if (!user || user.role !== "teacher") {
    return (
      <main className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Teacher not found</h1>
          <button onClick={()=>router.back()} className="px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-800 text-sm">Back</button>
        </div>
      </main>
    )
  }

  return (
      <main className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={user.avatarUrl || "/placeholder-user.jpg"} className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <div className="text-slate-400 text-sm">@{user.username} • {user.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/dashboard/admin/settings/wallet?userId=${user.id}`} className="px-3 py-1.5 rounded border border-cyan-700 text-cyan-300 hover:bg-cyan-900/30 text-sm">Manage Wallet</Link>
            <button onClick={()=>router.back()} className="px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-800 text-sm">Back</button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12 lg:col-span-8">
            <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
              <h2 className="font-semibold mb-3">Profile</h2>
              <div className="text-sm text-slate-300">School: <span className="text-slate-400">{user.schoolId ?? "—"}</span></div>
              <div className="text-sm text-slate-300 mt-1">Status: <span className="text-green-400">Active</span></div>
            </section>

            <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 mt-4">
              <h2 className="font-semibold mb-3">Recent Transactions</h2>
              <div className="text-sm text-slate-400">Coming soon — link to transactions feed.</div>
            </section>
          </div>
          <div className="col-span-12 lg:col-span-4">
            <WalletBalanceCard userId={user.id} />
          </div>
        </div>
      </main>
  )
}
