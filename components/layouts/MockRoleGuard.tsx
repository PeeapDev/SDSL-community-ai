"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useMockAuth } from "@/components/providers/MockAuthProvider"

type Props = {
  allow: Array<"student" | "teacher" | "admin" | "vendor">
  children: React.ReactNode
}

export default function MockRoleGuard({ allow, children }: Props) {
  const router = useRouter()
  const { role, userId } = useMockAuth()
  const [ok, setOk] = useState(false)

  useEffect(() => {
    if (!userId) return
    if (allow.includes(role)) setOk(true)
    else router.replace(`/dashboard/${role}`)
  }, [role, allow, router, userId])

  if (!ok) return null
  return <>{children}</>
}
