"use client"

import { useMemo, useState } from "react"
import type { QuizSpec } from "@/types/activity"

export default function Quiz({ spec }: { spec: QuizSpec }) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({})
  const items = spec.items

  const score = useMemo(() => {
    let correct = 0
    items.forEach((q) => {
      const a = answers[q.id]
      if (typeof a === "number" && a === q.answer_index) correct += 1
    })
    return { correct, total: items.length }
  }, [answers, items])

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{spec.title}</h1>
        {spec.instructions && <p className="text-sm text-muted-foreground">{spec.instructions}</p>}
      </header>

      <ol className="space-y-6">
        {items.map((q, idx) => (
          <li key={q.id} className="border rounded-lg p-4">
            <div className="mb-3 font-medium">{idx + 1}. {q.question}</div>
            <div className="space-y-2">
              {q.choices.map((c, i) => {
                const selected = answers[q.id] === i
                const isCorrect = i === q.answer_index
                const showState = selected ? (isCorrect ? "bg-green-100" : "bg-red-100") : ""
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: i }))}
                    className={`w-full text-left border rounded px-3 py-2 hover:bg-gray-50 ${showState}`}
                  >
                    {c}
                  </button>
                )
              })}
            </div>
            {typeof answers[q.id] === "number" && q.explanation && (
              <p className="mt-3 text-sm text-muted-foreground">Explanation: {q.explanation}</p>
            )}
          </li>
        ))}
      </ol>

      <footer className="flex items-center justify-between border-t pt-4">
        <div className="text-sm">Score: {score.correct} / {score.total}</div>
      </footer>
    </div>
  )
}
