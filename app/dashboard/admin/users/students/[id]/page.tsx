"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { getUserById } from "@/lib/mockUsers"
import { WalletBalanceCard } from "@/components/wallet/WalletBalanceCard"

export default function AdminStudentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string
  const user = getUserById(id)

  if (!user || user.role !== "student") {
    return (
      <MockRoleGuard allow={["admin"]}>
        <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Student not found</h1>
            <button onClick={()=>router.back()} className="px-3 py-1.5 rounded border border-slate-700 hover:bg-slate-800 text-sm">Back</button>
          </div>
        </main>
      </MockRoleGuard>
    )
  }

  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
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
    </MockRoleGuard>
  )
}
