"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import Dashboard from "@/dashboard"

export default function StudentDashboardPage() {
  return (
    <MockRoleGuard allow={["student"]}>
      <Dashboard />
    </MockRoleGuard>
  )
}
