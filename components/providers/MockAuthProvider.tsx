"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

type Role = "student" | "teacher" | "admin" | "vendor"

type AuthContextValue = {
  userId: string | null
  role: Role
  setRole: (r: Role) => void
  signInAnon: () => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [role, setRoleState] = useState<Role>("student")

  useEffect(() => {
    const saved = localStorage.getItem("mock-auth")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setUserId(parsed.userId ?? null)
        setRoleState((parsed.role as Role) ?? "student")
      } catch {}
    } else {
      // start anonymous
      const uid = crypto.randomUUID()
      setUserId(uid)
      localStorage.setItem("mock-auth", JSON.stringify({ userId: uid, role: "student" }))
    }
  }, [])

  function persist(next: Partial<{ userId: string | null; role: Role }>) {
    const current = { userId, role, ...next }
    localStorage.setItem("mock-auth", JSON.stringify(current))
  }

  function setRole(r: Role) {
    setRoleState(r)
    persist({ role: r })
  }

  function signInAnon() {
    const uid = crypto.randomUUID()
    setUserId(uid)
    persist({ userId: uid })
  }

  function signOut() {
    setUserId(null)
    persist({ userId: null })
  }

  const value = useMemo<AuthContextValue>(() => ({ userId, role, setRole, signInAnon, signOut }), [userId, role])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useMockAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useMockAuth must be used within MockAuthProvider")
  return ctx
}
