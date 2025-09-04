"use client"

import { useEffect, useState } from "react"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { createGroup, joinGroup, leaveGroup, listGroups, listMyGroups, seedDemoGroups, type Group } from "@/lib/groupStore"

export default function GroupsPage() {
  const { userId } = useMockAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [mine, setMine] = useState<Group[]>([])
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")

  function refresh() {
    setGroups(listGroups())
    if (userId) setMine(listMyGroups(userId))
  }
  useEffect(()=>{ if (userId){ seedDemoGroups(userId); refresh() } }, [userId])

  function onCreate() {
    if (!userId || !name.trim()) return
    createGroup(userId, name.trim(), desc.trim() || undefined)
    setName("")
    setDesc("")
    refresh()
  }

  function onJoin(id: string) { if (!userId) return; joinGroup(id, userId); refresh() }
  function onLeave(id: string) { if (!userId) return; leaveGroup(id, userId); refresh() }
  const isMember = (id: string) => mine.some(m => m.id === id)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Groups / Class Communities</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 bg-slate-900/50 border border-slate-800 rounded p-4">
          <div className="text-sm font-medium">Create Group</div>
          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Group name" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" />
          <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Description (optional)" className="w-full h-24 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" />
          <button onClick={onCreate} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700">Create</button>
        </div>

        <div className="space-y-2 bg-slate-900/50 border border-slate-800 rounded p-4">
          <div className="text-sm font-medium">All Groups</div>
          {groups.length===0 && <div className="text-xs text-slate-500">No groups yet.</div>}
          {groups.map(g => (
            <div key={g.id} className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded px-3 py-2">
              <div>
                <div className="font-medium">{g.name}</div>
                {g.description && <div className="text-xs text-slate-500">{g.description}</div>}
              </div>
              {isMember(g.id) ? (
                <button onClick={()=>onLeave(g.id)} className="px-2 py-1 text-xs rounded bg-rose-700/70 border border-rose-800">Leave</button>
              ) : (
                <button onClick={()=>onJoin(g.id)} className="px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700">Join</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
