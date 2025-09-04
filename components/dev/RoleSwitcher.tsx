"use client"

import { useMockAuth } from "@/components/providers/MockAuthProvider"

export default function RoleSwitcher() {
  const { role, setRole } = useMockAuth()
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border shadow rounded-lg p-2 flex items-center gap-2">
      <span className="text-xs text-gray-500">Role</span>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
      >
        <option value="student">student</option>
        <option value="teacher">teacher</option>
        <option value="admin">admin</option>
        <option value="vendor">vendor</option>
      </select>
    </div>
  )
}
