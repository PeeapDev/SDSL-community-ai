"use client"

import type { ActivitySpec, QuizSpec } from "@/types/activity"

const KEY_ACTIVITIES = "mock-activities"

export type Activity = {
  id: string
  title: string
  type: ActivitySpec["type"]
  spec: ActivitySpec
  createdAt: string
}

function readAll(): Activity[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(KEY_ACTIVITIES)
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as Activity[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeAll(items: Activity[]) {
  localStorage.setItem(KEY_ACTIVITIES, JSON.stringify(items))
}

export function listActivities(): Activity[] {
  return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function getActivity(id: string): Activity | null {
  return readAll().find((a) => a.id === id) ?? null
}

export function createQuiz(input: Omit<QuizSpec, "type"> & { type?: "quiz" }): Activity {
  const spec: QuizSpec = { type: "quiz", ...input }
  const activity: Activity = {
    id: crypto.randomUUID(),
    title: spec.title,
    type: spec.type,
    spec,
    createdAt: new Date().toISOString(),
  }
  const all = readAll()
  all.push(activity)
  writeAll(all)
  return activity
}
