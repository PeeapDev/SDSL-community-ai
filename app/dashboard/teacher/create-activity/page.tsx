"use client"

import { useState } from "react"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { createQuiz } from "@/lib/mockStore"
import { useRouter } from "next/navigation"

export default function CreateActivityPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [instructions, setInstructions] = useState("Choose the best answer.")
  const [topic, setTopic] = useState("")

  function createSampleQuiz() {
    const activity = createQuiz({
      title: title || (topic ? `${topic} Quiz` : "Untitled Quiz"),
      instructions,
      items: [
        {
          id: "q1",
          question: `What is 2 + 2?`,
          choices: ["3", "4", "5"],
          answer_index: 1,
          explanation: "2 + 2 equals 4",
        },
        {
          id: "q2",
          question: `Which planet is known as the Red Planet?`,
          choices: ["Earth", "Mars", "Jupiter"],
          answer_index: 1,
          explanation: "Mars appears red due to iron oxide.",
        },
      ],
      difficulty: "easy",
      subjects: topic ? [topic] : [],
    })
    router.push(`/activities/${activity.id}/play`)
  }

  return (
    <MockRoleGuard allow={["teacher"]}>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">Create Activity (Mock)</h1>
          <p className="text-sm text-muted-foreground">Client-only creation stored in localStorage.</p>
        </header>

        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input className="w-full border rounded px-3 py-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Instructions</label>
            <input className="w-full border rounded px-3 py-2" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Topic (optional)</label>
            <input className="w-full border rounded px-3 py-2" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={createSampleQuiz} className="px-4 py-2 rounded bg-black text-white">Create Sample Quiz</button>
        </div>
      </div>
    </MockRoleGuard>
  )
}
