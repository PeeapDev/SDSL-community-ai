"use client"

export type Profile = {
  userId: string
  displayName?: string
  avatarUrl?: string
  social: {
    blockTagging: boolean
    requireGroupConsent: boolean
  }
}

const KEY = "profile_store_v1"

function readAll(): Record<string, Profile> {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function writeAll(data: Record<string, Profile>) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function getProfile(userId: string): Profile {
  const all = readAll()
  if (!all[userId]) {
    all[userId] = { userId, social: { blockTagging: false, requireGroupConsent: true } }
    writeAll(all)
  }
  return all[userId]
}

export function updateProfile(userId: string, patch: Partial<Profile>) {
  const all = readAll()
  const current = all[userId] ?? { userId, social: { blockTagging: false, requireGroupConsent: true } }
  all[userId] = {
    ...current,
    ...patch,
    social: { ...current.social, ...(patch.social ?? {}) },
  }
  writeAll(all)
  return all[userId]
}
