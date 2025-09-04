"use client"

export type School = {
  id: string
  name: string
  code: string
  createdAt: string
}

const KEY_SCHOOLS = "mock-schools"

function readAll(): School[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(KEY_SCHOOLS)
    if (!raw) return []
    const arr = JSON.parse(raw) as School[]
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeAll(items: School[]) {
  if (typeof window === "undefined") return
  localStorage.setItem(KEY_SCHOOLS, JSON.stringify(items))
}

function generateCode(existing: Set<string>): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // avoid confusing chars
  while (true) {
    let c = ""
    for (let i = 0; i < 6; i++) c += alphabet[Math.floor(Math.random() * alphabet.length)]
    if (!existing.has(c)) return c
  }
}

export function listSchools(): School[] {
  return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function findByCode(code: string): School | null {
  const c = code.trim().toUpperCase()
  return readAll().find((s) => s.code === c) ?? null
}

export function createSchool(name: string): School {
  const all = readAll()
  const codes = new Set(all.map((s) => s.code))
  const school: School = {
    id: crypto.randomUUID(),
    name: name.trim(),
    code: generateCode(codes),
    createdAt: new Date().toISOString(),
  }
  all.push(school)
  writeAll(all)
  return school
}
