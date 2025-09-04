"use client"

import { useEffect, useState } from "react"
import { getLeaderboard, joinQuiz, listLiveQuizzes, listParticipants, setQuizStatus, type LiveQuiz, type LiveQuizStatus } from "@/lib/liveQuizStore"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { getUserById } from "@/lib/mockUsers"

export default function ManageEventsPage() {
  const { userId } = useMockAuth()
  const [quizzes, setQuizzes] = useState<LiveQuiz[]>([])
  const [selected, setSelected] = useState<string>("")

  function refresh() {
    setQuizzes(listLiveQuizzes())
  }
  useEffect(()=>{ refresh() }, [])

  function setStatus(id: string, status: LiveQuizStatus) {
    setQuizStatus(id, status)
    refresh()
  }

  function onJoin(id: string) {
    if (!userId) return
    joinQuiz(id, userId)
    alert("Joined lobby")
    refresh()
  }

  const chosen = quizzes.find(q=>q.id===selected) || quizzes[0]
  const parts = chosen ? listParticipants(chosen.id) : []
  const leaderboard = chosen ? getLeaderboard(chosen.id) : []

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Manage Upcoming Events</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 bg-slate-900/50 border border-slate-800 rounded p-4">
          {quizzes.length===0 && <div className="text-slate-400 text-sm">No quizzes yet.</div>}
          {quizzes.map((q)=> (
            <div key={q.id} className={`p-3 rounded border ${chosen?.id===q.id?"border-slate-600 bg-slate-800/60":"border-slate-800 bg-slate-900/40"}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{q.title}</div>
                  <div className="text-xs text-slate-400">Status: {q.status}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setSelected(q.id)} className="px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700">View</button>
                  <button onClick={()=>onJoin(q.id)} className="px-2 py-1 text-xs rounded bg-slate-800 border border-slate-700">Join</button>
                </div>
              </div>
              <div className="mt-2 flex gap-2 text-xs">
                <button onClick={()=>setStatus(q.id, "lobby")} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Open Lobby</button>
                <button onClick={()=>setStatus(q.id, "live")} className="px-2 py-1 rounded bg-green-700/70 border border-green-800">Start Live</button>
                <button onClick={()=>setStatus(q.id, "ended")} className="px-2 py-1 rounded bg-rose-700/70 border border-rose-800">End</button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 bg-slate-900/50 border border-slate-800 rounded p-4">
          {chosen ? (
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">{chosen.title}</div>
                  <div className="text-xs text-slate-400">Players: {parts.length}</div>
                </div>
                <div className="text-xs text-slate-400">Questions: {chosen.questions.length}</div>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Leaderboard (mock)</div>
                <div className="space-y-1">
                  {leaderboard.length===0 && <div className="text-xs text-slate-500">No submissions yet.</div>}
                  {leaderboard.map((r, i)=>{
                    const u = getUserById(r.userId)
                    return (
                      <div key={r.userId} className="flex items-center justify-between text-sm bg-slate-950/60 border border-slate-800 rounded px-3 py-2">
                        <div className="flex items-center gap-2">
                          <img src={u?.avatarUrl||"/placeholder-user.jpg"} className="h-6 w-6 rounded-full" />
                          <div>{u?.displayName||r.userId}</div>
                          <div className="text-slate-500">@{u?.username||r.userId}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono">{r.score} pts</div>
                          <div className="text-xs text-slate-500">{r.correct}/{r.total}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-sm">Select a quiz to view details</div>
          )}
        </div>
      </div>
    </div>
  )
}
