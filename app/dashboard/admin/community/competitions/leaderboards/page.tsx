"use client"

import { useMemo, useState } from "react"
import { getLeaderboard, listLiveQuizzes } from "@/lib/liveQuizStore"
import { getUserById } from "@/lib/mockUsers"

export default function LeaderboardsPage() {
  const quizzes = listLiveQuizzes()
  const [sel, setSel] = useState<string>(quizzes[0]?.id ?? "")
  const rows = useMemo(()=> sel ? getLeaderboard(sel) : [], [sel])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Leaderboards</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
          <label className="block text-sm mb-2">Select Quiz</label>
          <select value={sel} onChange={(e)=>setSel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm">
            {quizzes.map(q=> <option key={q.id} value={q.id}>{q.title}</option>)}
          </select>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 rounded p-4">
          <div className="text-sm font-medium mb-2">Top Players</div>
          <div className="space-y-1">
            {rows.length===0 && <div className="text-xs text-slate-500">No data.</div>}
            {rows.map((r, i)=>{
              const u = getUserById(r.userId)
              return (
                <div key={r.userId} className="flex items-center justify-between text-sm bg-slate-950/60 border border-slate-800 rounded px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 text-center">#{i+1}</div>
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
    </div>
  )
}
