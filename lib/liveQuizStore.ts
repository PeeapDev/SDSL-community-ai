// Mock live quiz store with localStorage persistence
export type QuizMode = "realtime" | "timed"
export type AudienceType = "school" | "class" | "selected"
export type QuizSourceType = "ai" | "h5p" | "library"
export type LiveQuizStatus = "draft" | "scheduled" | "lobby" | "live" | "ended"

export interface LiveQuiz {
  id: string
  title: string
  sourceType: QuizSourceType
  sourceRef?: string
  startAt?: number // epoch ms
  mode: QuizMode
  audience: { type: AudienceType; refIds?: string[] }
  hostId: string
  createdAt: number
  status: LiveQuizStatus
  questions: Array<{
    id: string
    text: string
    type: "mcq" | "tf"
    options?: string[]
    answerIndex?: number // for mock scoring (mcq)
    answerBool?: boolean // for mock scoring (tf)
    timeLimitSec?: number
  }>
}

export interface QuizParticipant {
  quizId: string
  userId: string
  joinedAt: number
  score: number
  answers: Array<{ questionId: string; answer: number | boolean; correct: boolean; timeMs?: number }>
}

const QUIZ_KEY = "live_quizzes_v1"
const PART_KEY = "quiz_participants_v1"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function write<T>(key: string, value: T) { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)) }

export function listLiveQuizzes(): LiveQuiz[] { return read<LiveQuiz[]>(QUIZ_KEY, []) }
export function listParticipants(quizId: string): QuizParticipant[] {
  const all = read<QuizParticipant[]>(PART_KEY, [])
  return all.filter(p => p.quizId === quizId)
}

export function createLiveQuiz(input: Omit<LiveQuiz, "id"|"createdAt"|"status"> & Partial<Pick<LiveQuiz, "status">>): LiveQuiz {
  const quizzes = listLiveQuizzes()
  const id = `quiz_${Date.now()}`
  const quiz: LiveQuiz = {
    id,
    createdAt: Date.now(),
    status: input.status ?? (input.startAt ? "scheduled" : "draft"),
    ...input,
  }
  write(QUIZ_KEY, [quiz, ...quizzes])
  return quiz
}

export function setQuizStatus(id: string, status: LiveQuizStatus) {
  const quizzes = listLiveQuizzes().map(q => q.id === id ? { ...q, status } : q)
  write(QUIZ_KEY, quizzes)
}

export function joinQuiz(quizId: string, userId: string): QuizParticipant {
  const parts = read<QuizParticipant[]>(PART_KEY, [])
  const existing = parts.find(p => p.quizId === quizId && p.userId === userId)
  if (existing) return existing
  const p: QuizParticipant = { quizId, userId, joinedAt: Date.now(), score: 0, answers: [] }
  write(PART_KEY, [...parts, p])
  return p
}

export function submitAnswer(quizId: string, userId: string, questionId: string, answer: number | boolean, timeMs?: number) {
  const quizzes = listLiveQuizzes()
  const quiz = quizzes.find(q => q.id === quizId)
  if (!quiz) return
  const parts = read<QuizParticipant[]>(PART_KEY, [])
  const idx = parts.findIndex(p => p.quizId === quizId && p.userId === userId)
  if (idx < 0) return
  const q = quiz.questions.find(x => x.id === questionId)
  let correct = false
  if (q?.type === "mcq" && typeof answer === "number") correct = q.answerIndex === answer
  if (q?.type === "tf" && typeof answer === "boolean") correct = q.answerBool === answer
  const delta = correct ? 100 : 0
  const upd = { ...parts[idx] }
  upd.answers = [...upd.answers, { questionId, answer, correct, timeMs }]
  upd.score += delta
  parts[idx] = upd
  write(PART_KEY, parts)
}

export function getLeaderboard(quizId: string): Array<{ userId: string; score: number; correct: number; total: number }>{
  const quizzes = listLiveQuizzes()
  const quiz = quizzes.find(q => q.id === quizId)
  const total = quiz?.questions.length ?? 0
  const rows = listParticipants(quizId).map(p => ({ userId: p.userId, score: p.score, correct: p.answers.filter(a=>a.correct).length, total }))
  return rows.sort((a,b)=>b.score - a.score)
}

// Seed a sample quiz for demo if none
export function seedLiveQuizDemo(hostId: string) {
  const existing = listLiveQuizzes()
  if (existing.length > 0) return
  createLiveQuiz({
    title: "General Knowledge Sprint",
    sourceType: "ai",
    mode: "realtime",
    audience: { type: "school" },
    hostId,
    questions: [
      { id: "q1", text: "The earth is flat.", type: "tf", answerBool: false, timeLimitSec: 15 },
      { id: "q2", text: "2 + 2 = ?", type: "mcq", options: ["3","4","5","22"], answerIndex: 1, timeLimitSec: 20 },
    ],
  })
}
