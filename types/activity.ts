export type QuizItem = {
  id: string
  question: string
  choices: string[]
  answer_index: number
  explanation?: string
}

export type QuizSpec = {
  type: "quiz"
  title: string
  instructions?: string
  items: QuizItem[]
  difficulty?: "easy" | "medium" | "hard"
  subjects?: string[]
  estimated_minutes?: number
  images?: { id: string; url?: string; alt: string; prompt?: string }[]
}

export type MatchingSpec = {
  type: "matching"
  title: string
  pairs: { left: string; right: string }[]
}

export type CrosswordEntry = {
  id: string
  row: number
  col: number
  direction: "across" | "down"
  answer: string
  clue: string
}

export type CrosswordSpec = {
  type: "crossword"
  title: string
  grid: { rows: number; cols: number }
  entries: CrosswordEntry[]
}

export type FlashcardsSpec = {
  type: "flashcards"
  title: string
  cards: { front: string; back: string }[]
  images?: { id: string; url?: string; alt: string; prompt?: string }[]
}

export type DragDropSpec = {
  type: "drag_drop"
  title: string
  prompt?: string
  targets: { id: string; label: string; x: number; y: number }[]
  draggables: { id: string; text: string }[]
  background_image?: { url: string; alt: string }
}

export type ActivitySpec = QuizSpec | MatchingSpec | CrosswordSpec | FlashcardsSpec | DragDropSpec
