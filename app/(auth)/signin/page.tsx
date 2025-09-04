"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import Link from "next/link"
import { Suspense, useMemo, useState } from "react"

export default function SignInPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center text-slate-400">Loading…</main>}>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const router = useRouter()
  const { setRole, signInAnon, userId } = useMockAuth()
  const search = useSearchParams()
  const initialTab = (search.get("tab") === "signup" ? "signup" : (search.get("tab") === "signin" ? "signin" : "signin")) as "signin" | "signup"
  const [tab, setTab] = useState<"signin" | "signup">(initialTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  // Heuristic to decide whether to enable real auth actions
  const supabaseConfigured = useMemo(() => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY), [])

  function demoLogin(role: "student" | "teacher" | "admin" | "vendor") {
    // ensure a mock user exists
    if (!userId) signInAnon()
    setRole(role)
    router.replace(`/dashboard/${role}`)
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerContent
        tab={tab}
        setTab={setTab}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        confirm={confirm}
        setConfirm={setConfirm}
        loading={loading}
        setLoading={setLoading}
        msg={msg}
        setMsg={setMsg}
        supabaseConfigured={supabaseConfigured}
        demoLogin={demoLogin}
      />
    </Suspense>
  )
}

function InnerContent({
  tab,
  setTab,
  email,
  setEmail,
  password,
  setPassword,
  confirm,
  setConfirm,
  loading,
  setLoading,
  msg,
  setMsg,
  supabaseConfigured,
  demoLogin,
}: {
  tab: "signin" | "signup"
  setTab: (tab: "signin" | "signup") => void
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  confirm: string
  setConfirm: (confirm: string) => void
  loading: boolean
  setLoading: (loading: boolean) => void
  msg: string | null
  setMsg: (msg: string | null) => void
  supabaseConfigured: boolean
  demoLogin: (role: "student" | "teacher" | "admin" | "vendor") => void
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 flex items-center justify-center px-6 py-12 text-slate-100">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <div className="hidden md:block">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-slate-300 hover:text-white text-sm">← Back to Home</Link>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight">
            Welcome to <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Campus AI</span>
          </h1>
          <p className="mt-4 text-slate-300">Sign in, sign up, or try a demo role to explore student, teacher, and admin dashboards.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <Feature title="All-in-one" desc="Classes, assignments, grades, messaging" />
            <Feature title="Role-based" desc="Student, Teacher, and Admin experiences" />
            <Feature title="Modern UI" desc="Fast, accessible, and responsive" />
            <Feature title="Secure-ready" desc="Bring your own auth provider" />
          </div>
        </div>

        {/* Right: Auth Card */}
        <div className="relative">
          <div className="absolute -inset-3 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 blur-2xl rounded-3xl" />
          <div className="relative border border-slate-800 rounded-2xl bg-slate-900/60 p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold">Access your account</div>
              <div className="text-xs text-slate-400">Demo available</div>
            </div>

            {/* Tabs */}
            <div className="mt-4 grid grid-cols-2 text-sm rounded-lg overflow-hidden border border-slate-800">
              <button onClick={() => setTab("signin")} className={`py-2 ${tab === "signin" ? "bg-slate-800" : "bg-transparent"}`}>Sign in</button>
              <button onClick={() => setTab("signup")} className={`py-2 ${tab === "signup" ? "bg-slate-800" : "bg-transparent"}`}>Sign up</button>
            </div>

            {/* Forms */}
            <form
              className="mt-6 space-y-3"
              onSubmit={async (e) => {
                e.preventDefault()
                setMsg(null)
                if (!supabaseConfigured) {
                  setMsg("Email/password requires Supabase. Use demo or configure NEXT_PUBLIC_SUPABASE_* envs.")
                  return
                }
                try {
                  setLoading(true)
                  // To fully enable, install @supabase/supabase-js and wire calls here.
                  // Placeholder UX until configured:
                  await new Promise((r) => setTimeout(r, 700))
                  setMsg(tab === "signin" ? "Signed in (placeholder)." : "Signed up (placeholder). Check your email.")
                } finally {
                  setLoading(false)
                }
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm text-slate-300">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm outline-none focus:border-cyan-600"
                  placeholder="you@example.com"
                  type="email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm outline-none focus:border-cyan-600"
                  placeholder="••••••••"
                  required
                />
              </div>
              {tab === "signup" && (
                <div className="grid gap-2">
                  <label className="text-sm text-slate-300">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm outline-none focus:border-cyan-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}
              {msg && <p className="text-xs text-amber-400">{msg}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 rounded px-4 py-2 text-sm font-medium"
              >
                {loading ? (tab === "signin" ? "Signing in…" : "Creating account…") : (tab === "signin" ? "Sign in" : "Sign up")}
              </button>
              {!supabaseConfigured && (
                <p className="text-xs text-slate-400 mt-2">To enable email/password, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and install dependencies.</p>
              )}
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-800" />
              <span>or try demo</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            {/* Demo buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button type="button" onClick={() => demoLogin("student")} className="px-3 py-2 rounded border border-slate-800 bg-slate-950 text-sm hover:bg-slate-900">Student</button>
              <button type="button" onClick={() => demoLogin("teacher")} className="px-3 py-2 rounded border border-slate-800 bg-slate-950 text-sm hover:bg-slate-900">Teacher</button>
              <button type="button" onClick={() => demoLogin("admin")} className="px-3 py-2 rounded border border-slate-800 bg-slate-950 text-sm hover:bg-slate-900">Admin</button>
              <button type="button" onClick={() => demoLogin("vendor")} className="px-3 py-2 rounded border border-slate-800 bg-slate-950 text-sm hover:bg-slate-900">Vendor</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-slate-400 mt-1">{desc}</div>
    </div>
  )
}
