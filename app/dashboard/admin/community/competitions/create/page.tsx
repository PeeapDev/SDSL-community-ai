"use client"

import { useEffect, useState } from "react"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { AudienceType, QuizMode, QuizSourceType, createLiveQuiz, seedLiveQuizDemo } from "@/lib/liveQuizStore"

export default function CreateLiveQuizPage() {
  const { userId } = useMockAuth()
  const [title, setTitle] = useState("")
  const [sourceType, setSourceType] = useState<QuizSourceType>("ai")
  const [mode, setMode] = useState<QuizMode>("realtime")
  const [audType, setAudType] = useState<AudienceType>("school")
  const [startAt, setStartAt] = useState<string>("") // datetime-local

  useEffect(()=>{ if (userId) seedLiveQuizDemo(userId) }, [userId])

  function onCreate() {
    if (!userId) return
    const ts = startAt ? new Date(startAt).getTime() : undefined
    createLiveQuiz({
      title: title || "Untitled Quiz",
      sourceType,
      mode,
      audience: { type: audType },
      startAt: ts,
      hostId: userId,
      questions: [
        { id: "q1", text: "2+2?", type: "mcq", options: ["3","4","5","22"], answerIndex: 1, timeLimitSec: 20 },
        { id: "q2", text: "The sun rises in the east.", type: "tf", answerBool: true, timeLimitSec: 15 },
      ],
    })
    setTitle("")
    setStartAt("")
    alert("Live quiz created")
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Create Live Quiz</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 bg-slate-900/50 border border-slate-800 rounded p-4">
          <label className="block text-sm">Title</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" placeholder="e.g., Friday Challenge" />

          <label className="block text-sm mt-3">Source</label>
          <select value={sourceType} onChange={(e)=>setSourceType(e.target.value as QuizSourceType)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm">
            <option value="ai">AI-generated</option>
            <option value="h5p">H5P template</option>
            <option value="library">Content library</option>
          </select>

          <label className="block text-sm mt-3">Mode</label>
          <select value={mode} onChange={(e)=>setMode(e.target.value as QuizMode)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm">
            <option value="realtime">Real-time (everyone together)</option>
            <option value="timed">Timed window</option>
          </select>

          <label className="block text-sm mt-3">Start (optional)</label>
          <input type="datetime-local" value={startAt} onChange={(e)=>setStartAt(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" />

          <label className="block text-sm mt-3">Audience</label>
          <select value={audType} onChange={(e)=>setAudType(e.target.value as AudienceType)} className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm">
            <option value="school">Entire school</option>
            <option value="class">Specific class/group</option>
            <option value="selected">Selected students</option>
          </select>

          <div className="pt-4">
            <button onClick={onCreate} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700">Create</button>
          </div>
        </div>
        <div className="space-y-2 text-sm text-slate-400">
          <p>Flow:</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>Students see banner/popup and join the lobby.</li>
            <li>Host starts quiz; questions stream live; leaderboard updates.</li>
            <li>End session to view reports and export results.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
