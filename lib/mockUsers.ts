"use client"

export type MockUser = {
  id: string
  username: string
  displayName: string
  role: "student" | "teacher" | "admin" | "vendor"
  avatarUrl?: string
  schoolId?: string
}

const demoUsers: MockUser[] = [
  {
    id: "admin-1",
    username: "admin",
    displayName: "Administrator",
    role: "admin",
    avatarUrl: "/placeholder-user.jpg",
    schoolId: "school-a",
  },
  {
    id: "t-001",
    username: "mr_smith",
    displayName: "Mr. Smith",
    role: "teacher",
    avatarUrl: "/placeholder-user.jpg",
    schoolId: "school-a",
  },
  {
    id: "t-002",
    username: "ms_johnson",
    displayName: "Ms. Johnson",
    role: "teacher",
    avatarUrl: "/placeholder-user.jpg",
    schoolId: "school-a",
  },
  {
    id: "s-001",
    username: "alice",
    displayName: "Alice Chen",
    role: "student",
    avatarUrl: "/placeholder-user.jpg",
    schoolId: "school-a",
  },
  {
    id: "s-002",
    username: "bob",
    displayName: "Bob Lee",
    role: "student",
    avatarUrl: "/placeholder-user.jpg",
    schoolId: "school-a",
  },
  {
    id: "s-003",
    username: "charlie",
    displayName: "Charlie Kim",
    role: "student",
    avatarUrl: "/placeholder-user.jpg",
    schoolId: "school-b",
  },
  // Vendors
  {
    id: "v-001",
    username: "campus_store",
    displayName: "Campus Store",
    role: "vendor",
    avatarUrl: "/placeholder-logo.png",
    schoolId: "school-a",
  },
  {
    id: "v-002",
    username: "sports_shop",
    displayName: "Sports Shop",
    role: "vendor",
    avatarUrl: "/placeholder-logo.png",
    schoolId: "school-a",
  },
]

function readCustomAdded(): MockUser[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem("mock-users-added")
    return raw ? (JSON.parse(raw) as MockUser[]) : []
  } catch {
    return []
  }
}

function allUsers(): MockUser[] {
  // In future we might merge admin-added users
  const added = readCustomAdded()
  return [...demoUsers, ...added]
}

export function getAllUsers(): MockUser[] {
  return allUsers()
}

export function getUserById(id: string): MockUser | undefined {
  return allUsers().find(u => u.id === id)
}

export function getUserByUsername(username: string): MockUser | undefined {
  const uname = username.toLowerCase()
  return allUsers().find(u => u.username.toLowerCase() === uname)
}

export function searchUsersByUsername(query: string, opts?: { limit?: number; excludeIds?: string[]; roles?: ("student"|"teacher"|"admin"|"vendor")[] }): MockUser[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const exclude = new Set(opts?.excludeIds ?? [])
  const roles = opts?.roles ? new Set(opts.roles) : null
  const results = allUsers().filter(u => {
    if (exclude.has(u.id)) return false
    if (roles && !roles.has(u.role)) return false
    return u.username.toLowerCase().includes(q)
  })
  return results.slice(0, opts?.limit ?? 8)
}
