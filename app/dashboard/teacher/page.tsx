"use client"

import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import TeacherDashboard from "@/teacher-dashboard"

export default function TeacherDashboardPage() {
  return (
    <MockRoleGuard allow={["teacher"]}>
      <TeacherDashboard />
    </MockRoleGuard>
  )
}
