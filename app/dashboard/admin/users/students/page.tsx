"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import Link from "next/link"
import { getAllUsers } from "@/lib/mockUsers"

export default function AdminUsersStudentsPage() {
  const students = getAllUsers().filter(u => u.role === "student")
  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">User Management — Students</h1>
        <p className="text-slate-400 mt-2">Demo list of students with usernames and avatars (mock directory).</p>
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
              {students.map(s => (
                <tr key={s.id} className="border-t border-slate-800">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <img src={s.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-8 w-8 rounded-full object-cover" />
                      <div className="text-slate-200">{s.displayName}</div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-slate-400">@{s.username}</td>
                  <td className="px-4 py-2 capitalize">{s.role}</td>
                  <td className="px-4 py-2">{s.schoolId ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-400">Active</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/admin/users/students/${s.id}`} className="px-2 py-1 text-xs rounded border border-slate-700 hover:bg-slate-800">View</Link>
                      <Link href={`/dashboard/admin/settings/wallet?userId=${s.id}`} className="px-2 py-1 text-xs rounded border border-cyan-700 text-cyan-300 hover:bg-cyan-900/30">Manage Wallet</Link>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">No demo students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </MockRoleGuard>
  )
}
