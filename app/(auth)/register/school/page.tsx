"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSchool, type School } from "@/lib/mockSchools"
import { useMockAuth } from "@/components/providers/MockAuthProvider"

export default function RegisterSchoolPage() {
  const router = useRouter()
  const { setRole, signInAnon } = useMockAuth()
  const [name, setName] = useState("")
  const [school, setSchool] = useState<School | null>(null)
  const [error, setError] = useState<string>("")
  const [copyOk, setCopyOk] = useState(false)

  function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const n = name.trim()
    if (!n) {
      setError("Please enter a school name.")
      return
    }
    const s = createSchool(n)
    setSchool(s)
  }

  async function onContinue() {
    await signInAnon()
    setRole("admin")
    router.replace("/dashboard/admin")
  }

  async function copyCode() {
    if (!school) return
    try {
      await navigator.clipboard.writeText(school.code)
      setCopyOk(true)
      setTimeout(() => setCopyOk(false), 1500)
    } catch {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-700/50 rounded-xl p-6">
        {!school ? (
          <>
            <h1 className="text-xl font-semibold mb-1">Register a School</h1>
            <p className="text-sm text-slate-400 mb-4">Create your school entity. A unique join code will be generated.</p>
            <form onSubmit={onCreate} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-slate-300">School name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Riverside High"
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
              {error && <div className="text-amber-400 text-sm">{error}</div>}
              <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 rounded-md py-2 text-sm font-medium">Create School</button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold mb-1">School Created</h1>
            <p className="text-sm text-slate-400">Share this join code with teachers and students:</p>
            <div className="mt-4 bg-slate-800/60 border border-slate-700/60 rounded-md p-4">
              <div className="text-xs text-slate-400">School</div>
              <div className="text-sm mb-3">{school.name}</div>
              <div className="text-xs text-slate-400">Join Code</div>
              <div className="flex items-center justify-between mt-1">
                <div className="font-mono text-2xl text-cyan-400 tracking-widest">{school.code}</div>
                <button onClick={copyCode} className="text-xs px-3 py-1 rounded-md border border-slate-700/60 bg-slate-900/40 hover:bg-slate-800/60">
                  {copyOk ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <button onClick={onContinue} className="w-full mt-6 bg-blue-600 hover:bg-blue-700 rounded-md py-2 text-sm font-medium">Continue to Admin Dashboard</button>
          </>
        )}
        <div className="mt-6 text-xs text-slate-500 text-center">
          Already have a code? <a href="/register/student" className="text-cyan-400 hover:underline">Join as Student</a> or <a href="/register/teacher" className="text-cyan-400 hover:underline">Join as Teacher</a>
        </div>
      </div>
    </div>
  )
}
