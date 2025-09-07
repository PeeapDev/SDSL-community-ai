"use client"

import { useEffect, useMemo, useState } from "react"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { listConversations, listMessages, sendMessageDM, type Conversation, type Message } from "@/lib/communitySocialStore"
import { getUserById, getUserByUsername, searchUsersByUsername } from "@/lib/mockUsers"

export default function AdminCommunityMessagesPage() {
  const { userId } = useMockAuth()
  const [convos, setConvos] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const [search, setSearch] = useState("")
  const [resultsOpen, setResultsOpen] = useState(false)

  function refresh() {
    if (!userId) return
    const cs = listConversations(userId)
    setConvos(cs)
    const pick = activeId ?? cs[0]?.id ?? null
    setActiveId(pick)
    if (pick) setMessages(listMessages(pick))
    else setMessages([])
  }
  useEffect(()=>{ refresh() }, [userId, activeId])

  function onSend() {
    if (!userId || !draft.trim()) return
    // For DM we need the other member
    const convo = convos.find(c => c.id === activeId)
    if (!convo) return
    const other = convo.memberIds.find(id => id !== userId)
    if (!other) return
    sendMessageDM(userId, other, draft.trim())
    setDraft("")
    refresh()
  }

  function startDMWithUserId(targetId: string) {
    if (!userId) return
    const { conversation } = sendMessageDM(userId, targetId, "Hello 👋")
    setActiveId(conversation.id)
    setSearch("")
    setResultsOpen(false)
    refresh()
  }

  function onStartDMByUsername() {
    if (!userId || !search.trim()) return
    const u = getUserByUsername(search.trim())
    if (u) startDMWithUserId(u.id)
  }

  return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Community — Messages</h1>
        <p className="text-slate-400 mt-2">Direct messages (client-side mock). Search users by username to start a DM.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <aside className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Conversations</h2>
            <div className="mt-2 relative text-xs">
              <input
                value={search}
                onChange={(e)=>{ setSearch(e.target.value); setResultsOpen(true) }}
                onFocus={()=>setResultsOpen(true)}
                placeholder="Search @username"
                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1"
              />
              {resultsOpen && search.trim() && (
                <div className="absolute z-10 mt-1 w-full bg-slate-900 border border-slate-800 rounded shadow-lg max-h-56 overflow-auto">
                  {searchUsersByUsername(search, { limit: 8 }).map(u => (
                    <button
                      key={u.id}
                      onClick={()=>startDMWithUserId(u.id)}
                      className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-slate-800"
                    >
                      <img src={u.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-6 w-6 rounded-full object-cover" />
                      <div>
                        <div className="text-slate-200 text-xs">{u.displayName}</div>
                        <div className="text-slate-500 text-[10px]">@{u.username} • {u.role}</div>
                      </div>
                    </button>
                  ))}
                  <div className="p-2 text-[10px] text-slate-500">Press Enter to DM exact username</div>
                </div>
              )}
              <div className="mt-2 flex gap-2">
                <button onClick={onStartDMByUsername} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Start</button>
                <button onClick={()=>{ setSearch(""); setResultsOpen(false) }} className="px-2 py-1 rounded bg-slate-900 border border-slate-800">Clear</button>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-sm">
              {convos.length === 0 && <div className="text-slate-400">No conversations yet.</div>}
              {convos.map(c => {
                const isActive = c.id === activeId
                const otherId = c.memberIds.find(id => id !== userId) || userId || ""
                const u = getUserById(otherId)
                return (
                  <button key={c.id} onClick={()=>setActiveId(c.id)} className={`w-full text-left px-2 py-2 rounded border flex items-center gap-2 ${isActive?"bg-slate-800 border-slate-600":"bg-slate-900 border-slate-800"}`}>
                    <img src={u?.avatarUrl || "/placeholder-user.jpg"} alt="" className="h-8 w-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-200 truncate">{u?.displayName || otherId}</div>
                      <div className="text-xs text-slate-500 truncate">@{u?.username || otherId}</div>
                    </div>
                    <div className="text-[10px] text-slate-500">{c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString() : ""}</div>
                  </button>
                )
              })}
            </div>
          </aside>
          <section className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            {!activeId && <div className="text-sm text-slate-400">Select a conversation to start chatting.</div>}
            {activeId && (
              <div className="flex flex-col h-[60vh]">
                <div className="flex-1 overflow-auto space-y-2 pr-1">
                  {messages.map(m => (
                    <div key={m.id} className={`max-w-[75%] rounded px-3 py-2 text-sm border ${m.senderId===userId?"ml-auto bg-cyan-900/30 border-cyan-800":"mr-auto bg-slate-900 border-slate-800"}`}>
                      <div className="text-xs text-slate-500">{new Date(m.createdAt).toLocaleTimeString()}</div>
                      <div>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <input value={draft} onChange={(e)=>setDraft(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
                  <button onClick={onSend} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700">Send</button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
  )
}

