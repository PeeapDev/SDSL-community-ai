"use client"

import type { ActivitySpec } from "@/types/activity"
import Quiz from "./Quiz"

export default function ActivityRenderer({ spec }: { spec: ActivitySpec }) {
  switch (spec.type) {
    case "quiz":
      return <Quiz spec={spec} />
    // Future: add matching, crossword, flashcards, drag_drop
    default:
      return <div className="p-6">Unsupported activity type: {spec.type}</div>
  }
}
