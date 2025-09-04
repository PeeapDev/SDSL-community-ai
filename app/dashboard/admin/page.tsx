"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import AdminDashboard from "@/admin-dashboard"

export default function AdminDashboardPage() {
  return (
    <MockRoleGuard allow={["admin"]}>
      <AdminDashboard />
    </MockRoleGuard>
  )
}
