"use client"

import React, { createContext, useContext, useMemo, useState } from "react"

type Ctx = {
  content: React.ReactNode | null
  setContent: (n: React.ReactNode | null) => void
  clear: () => void
}

const RightRailContext = createContext<Ctx | null>(null)

export function AdminRightRailProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<React.ReactNode | null>(null)
  const value = useMemo<Ctx>(() => ({ content, setContent, clear: () => setContent(null) }), [content])
  return <RightRailContext.Provider value={value}>{children}</RightRailContext.Provider>
}

export function RightRailSlot() {
  const ctx = useContext(RightRailContext)
  if (!ctx) return null
  return <>{ctx.content}</>
}

export function useAdminRightRail() {
  const ctx = useContext(RightRailContext)
  if (!ctx) throw new Error("useAdminRightRail must be used within AdminRightRailProvider")
  return ctx
}
