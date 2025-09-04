"use client"

import { useEffect, useState } from "react"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { acceptFriendRequest, denyFriendRequest, listFriendRequests, listFriends, sendFriendRequest, type Friendship } from "@/lib/communitySocialStore"
import { getUserById, getUserByUsername, searchUsersByUsername } from "@/lib/mockUsers"

export default function AdminCommunityFriendsPage() {
  const { userId } = useMockAuth()
  const [friends, setFriends] = useState<Friendship[]>([])
  const [requests, setRequests] = useState<Friendship[]>([])
  const [query, setQuery] = useState("")
  const [openResults, setOpenResults] = useState(false)

  function refresh() {
    if (!userId) return
    setFriends(listFriends(userId))
    setRequests(listFriendRequests(userId))
  }
  useEffect(()=>{ refresh() }, [userId])

  function onSendByUsername() {
    if (!userId || !query.trim()) return
    const u = getUserByUsername(query.trim())
    if (!u) return
    try { sendFriendRequest(userId, u.id) } catch {}
    setQuery("")
    setOpenResults(false)
    refresh()
  }

  return (
    <MockRoleGuard allow={["admin","teacher","student"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Community — Friends</h1>
        <p className="text-slate-400 mt-2">Manage friends and requests (client-side mock).</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Friend Requests</h2>
            {requests.length === 0 && <div className="text-sm text-slate-400 mt-2">No requests.</div>}
            <div className="mt-2 space-y-2">
              {requests.map(r => (
                <div key={r.id} className="bg-slate-900 border border-slate-800 rounded p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <img src={(getUserById(r.a)?.avatarUrl)||"/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full object-cover" />
                    <div>
                      <div className="text-slate-200">{getUserById(r.a)?.displayName || r.a}</div>
                      <div className="text-xs text-slate-500">@{getUserById(r.a)?.username || r.a}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={()=>{acceptFriendRequest(r.id); refresh()}} className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700">Accept</button>
                    <button onClick={()=>{denyFriendRequest(r.id); refresh()}} className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700">Deny</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <div className="text-slate-300 text-sm">Send Friend Request</div>
                <div className="relative">
                  <input value={query} onChange={(e)=>{ setQuery(e.target.value); setOpenResults(true) }} onFocus={()=>setOpenResults(true)} placeholder="Search @username" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
                  {openResults && query.trim() && (
                    <div className="absolute z-10 mt-1 w-full bg-slate-900 border border-slate-800 rounded shadow max-h-60 overflow-auto">
                      {searchUsersByUsername(query, { limit: 8 }).map(u => (
                        <button key={u.id} onClick={()=>{ try { userId && sendFriendRequest(userId, u.id) } catch {}; setQuery(""); setOpenResults(false); refresh() }} className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-slate-800">
                          <img src={u.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full object-cover" />
                          <div>
                            <div className="text-slate-200">{u.displayName}</div>
                            <div className="text-xs text-slate-500">@{u.username} • {u.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button onClick={onSendByUsername} className="px-3 py-2 rounded bg-slate-800 border border-slate-700">Send</button>
            </div>
            <h2 className="font-semibold mt-6">Friends</h2>
            {friends.length === 0 && <div className="text-sm text-slate-400 mt-2">No friends yet.</div>}
            <ul className="mt-2 space-y-2 text-sm">
              {friends.map(f => {
                const other = f.a === userId ? f.b : f.a
                return (
                  <li key={f.id} className="bg-slate-900 border border-slate-800 rounded p-3">
                    <div className="flex items-center gap-2">
                      <img src={(getUserById(other)?.avatarUrl)||"/placeholder-user.jpg"} alt="" className="h-7 w-7 rounded-full object-cover" />
                      <div>
                        <div className="text-slate-200">{getUserById(other)?.displayName || other}</div>
                        <div className="text-xs text-slate-500">@{getUserById(other)?.username || other}</div>
                        <div className="text-[10px] text-slate-600">since {new Date(f.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </main>
    </MockRoleGuard>
  )
}

