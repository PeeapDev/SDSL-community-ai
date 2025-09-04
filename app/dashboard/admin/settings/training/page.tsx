"use client"

import { useEffect, useState } from "react"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"

type Role = "admin" | "teacher" | "student"
type AllowedRoute = {
  id: string
  domainPattern: string // e.g., *.gov.school.edu.sl or educube.gov.school.edu.sl
  pathPattern: string   // e.g., /lessons/* or /api/notes
  roles: Role[]        // roles allowed to let the agent act on this route
  enabled: boolean
  description?: string
}

const STORAGE_KEY = "admin_allowed_routes"

export default function AdminSettingsTrainingPage() {
  const [routes, setRoutes] = useState<AllowedRoute[]>([])
  const [domainPattern, setDomainPattern] = useState("*.gov.school.edu.sl")
  const [pathPattern, setPathPattern] = useState("/lessons/*")
  const [roles, setRoles] = useState<Role[]>(["admin","teacher"]) // default
  const [description, setDescription] = useState("")

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setRoutes(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(routes)) } catch {}
  }, [routes])

  function toggleRole(r: Role) {
    setRoles((prev) => (prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]))
  }

  function addRoute() {
    if (!domainPattern || !pathPattern || roles.length === 0) return
    const item: AllowedRoute = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      domainPattern: domainPattern.trim(),
      pathPattern: pathPattern.trim(),
      roles: [...roles],
      enabled: true,
      description: description.trim() || undefined,
    }
    setRoutes((prev) => [item, ...prev])
    setDescription("")
  }

  function toggleEnabled(id: string) {
    setRoutes((prev) => prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  function removeRoute(id: string) {
    setRoutes((prev) => prev.filter(r => r.id !== id))
  }

  return (
    <MockRoleGuard allow={["admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Settings — Training</h1>
        <p className="text-slate-400 mt-2">
          Configure how the selected AI is trained with your local data and define routing rules for responses.
          This is a stub page to outline the workflow.
        </p>

        <section className="mt-6 space-y-4">
          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Allowed Routes for Chrome Extension</h2>
            <p className="text-sm text-slate-400">
              Whitelist domains and paths the extension-agent can act on, restricted by role. Example domains: educube.gov.school.edu.sl,
              ses.gov.school.edu.sl, or wildcard: *.gov.school.edu.sl.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Domain Pattern</label>
                <input value={domainPattern} onChange={(e)=>setDomainPattern(e.target.value)} placeholder="*.gov.school.edu.sl"
                       className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Path Pattern</label>
                <input value={pathPattern} onChange={(e)=>setPathPattern(e.target.value)} placeholder="/lessons/*"
                       className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Allowed Roles</label>
                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <label className="flex items-center gap-2"><input type="checkbox" checked={roles.includes("admin")} onChange={()=>toggleRole("admin")} /> Admin</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={roles.includes("teacher")} onChange={()=>toggleRole("teacher")} /> Teacher</label>
                  <label className="flex items-center gap-2"><input type="checkbox" checked={roles.includes("student")} onChange={()=>toggleRole("student")} /> Student</label>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Description (optional)</label>
                <input value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Create lesson note in portal"
                       className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="mt-3">
              <button onClick={addRoute} className="px-4 py-2 text-sm rounded bg-cyan-600 hover:bg-cyan-700">Add Allowed Route</button>
            </div>

            <div className="mt-5">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Configured Routes</h3>
              {routes.length === 0 && (<p className="text-sm text-slate-500">No routes yet. Add one above.</p>)}
              <div className="space-y-2">
                {routes.map((r) => (
                  <div key={r.id} className="bg-slate-900 border border-slate-800 rounded p-3 flex items-start justify-between">
                    <div>
                      <div className="text-sm text-slate-200 font-mono">{r.domainPattern}{r.pathPattern}</div>
                      {r.description && <div className="text-xs text-slate-400 mt-1">{r.description}</div>}
                      <div className="text-xs text-slate-400 mt-1">Roles: {r.roles.join(", ")}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={()=>toggleEnabled(r.id)} className={`px-3 py-1 text-xs rounded ${r.enabled?"bg-emerald-600 hover:bg-emerald-700":"bg-slate-700 hover:bg-slate-600"}`}>
                        {r.enabled ? "Enabled" : "Disabled"}
                      </button>
                      <button onClick={()=>removeRoute(r.id)} className="px-3 py-1 text-xs rounded bg-rose-600 hover:bg-rose-700">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Datasets & Sources</h2>
            <p className="text-sm text-slate-400">Upload files, connect storage, or reference internal collections.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Upload Documents</label>
                <input type="file" multiple className="block w-full text-sm text-slate-300" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Add External Source URL</label>
                <input type="url" placeholder="https://example.com/docs" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Vectorization & Indexing</h2>
            <p className="text-sm text-slate-400">Chunking, embeddings provider, and index refresh schedule.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Chunk Size</label>
                <input type="number" defaultValue={800} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Chunk Overlap</label>
                <input type="number" defaultValue={200} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Refresh (cron)</label>
                <input type="text" placeholder="0 2 * * *" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Routing Rules</h2>
            <p className="text-sm text-slate-400">Decide which queries go to which model or knowledge base.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Keyword Route</label>
                <input type="text" placeholder="e.g., grading -> policy-kb" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-300">Default Model</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm">
                  <option>gpt-4o-mini</option>
                  <option>gpt-4.1</option>
                  <option>claude-3.5</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Train & Evaluate</h2>
            <p className="text-sm text-slate-400">Trigger retraining and evaluate responses with test prompts.</p>
            <div className="mt-3 flex gap-3">
              <button className="px-4 py-2 text-sm rounded bg-cyan-600 hover:bg-cyan-700">Start Training (stub)</button>
              <button className="px-4 py-2 text-sm rounded bg-slate-800 border border-slate-700">Run Eval (stub)</button>
            </div>
          </div>
        </section>
      </main>
    </MockRoleGuard>
  )
}
