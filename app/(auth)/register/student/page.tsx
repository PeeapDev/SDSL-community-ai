"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { findByCode } from "@/lib/mockSchools"
import { useMockAuth } from "@/components/providers/MockAuthProvider"

export default function JoinAsStudentPage() {
  const router = useRouter()
  const { signInAnon, setRole } = useMockAuth()
  const [code, setCode] = useState("")
  const [error, setError] = useState<string>("")
  const [okMsg, setOkMsg] = useState<string>("")

  function onValidate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setOkMsg("")
    const c = code.trim().toUpperCase()
    if (c.length < 4) {
      setError("Enter a valid school code.")
      return
    }
    const school = findByCode(c)
    if (!school) {
      setError("Invalid code. Ask your school admin for the correct join code.")
      return
    }
    setOkMsg(`Joining: ${school.name}`)
  }

  async function onContinue() {
    await signInAnon()
    setRole("student")
    router.replace("/dashboard/student")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-black to-slate-900 text-slate-100">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-700/50 rounded-xl p-6">
        <h1 className="text-xl font-semibold mb-1">Join as Student</h1>
        <p className="text-sm text-slate-400 mb-4">Enter your school's join code to continue.</p>
        <form onSubmit={onValidate} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-slate-300">School Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., 9K2X7B"
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 tracking-widest uppercase"
            />
          </div>
          {error && <div className="text-amber-400 text-sm">{error}</div>}
          {okMsg && <div className="text-green-400 text-sm">{okMsg}</div>}
          <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 rounded-md py-2 text-sm font-medium">Validate Code</button>
        </form>
        <button onClick={onContinue} disabled={!okMsg} className="w-full mt-3 bg-blue-600 disabled:bg-slate-700/60 hover:bg-blue-700 rounded-md py-2 text-sm font-medium">Continue</button>
        <div className="mt-6 text-xs text-slate-500 text-center">
          Need a code? <a href="/register/school" className="text-cyan-400 hover:underline">Register your school</a>
        </div>
      </div>
    </div>
  )
}
