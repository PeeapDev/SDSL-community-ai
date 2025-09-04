"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getProfile, getSession, type Profile } from "@/lib/auth"

type Props = {
  allow: Array<NonNullable<Profile["role"]>>
  children: React.ReactNode
}

export default function RoleGuard({ allow, children }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading")

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const session = await getSession()
      if (!session) {
        setStatus("denied")
        router.replace("/signin")
        return
      }
      const profile = await getProfile()
      const role = profile?.role ?? null
      if (role && allow.includes(role)) {
        mounted && setStatus("allowed")
      } else if (role) {
        // Redirect to their own dashboard if role mismatch
        mounted && setStatus("denied")
        router.replace(`/dashboard/${role}`)
      } else {
        mounted && setStatus("denied")
        router.replace("/signin")
      }
    })()
    return () => {
      mounted = false
    }
  }, [router, allow])

  if (status !== "allowed") return null
  return <>{children}</>
}
