"use client"

export type FriendStatus = "pending" | "accepted" | "blocked"

export type Friendship = {
  id: string
  a: string // userId
  b: string // userId
  status: FriendStatus
  createdAt: string
}

export type Conversation = {
  id: string
  memberIds: string[] // 2 for DM
  lastMessageAt: string | null
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
}

const KEY_FRIENDS = "community_friends"
const KEY_CONVOS = "community_conversations"
const KEY_MESSAGES = "community_messages"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Friendships
export function listFriends(userId: string): Friendship[] {
  const all = read<Friendship[]>(KEY_FRIENDS, [])
  return all.filter(f => (f.a === userId || f.b === userId) && f.status === "accepted")
}
export function listFriendRequests(userId: string): Friendship[] {
  const all = read<Friendship[]>(KEY_FRIENDS, [])
  return all.filter(f => (f.b === userId) && f.status === "pending")
}
export function sendFriendRequest(fromId: string, toId: string): Friendship {
  if (fromId === toId) throw new Error("Cannot friend yourself")
  const all = read<Friendship[]>(KEY_FRIENDS, [])
  const exists = all.find(f => (f.a === fromId && f.b === toId) || (f.a === toId && f.b === fromId))
  if (exists) return exists
  const fr: Friendship = {
    id: crypto.randomUUID(),
    a: fromId,
    b: toId,
    status: "pending",
    createdAt: new Date().toISOString(),
  }
  all.push(fr)
  write(KEY_FRIENDS, all)
  return fr
}
export function acceptFriendRequest(requestId: string) {
  const all = read<Friendship[]>(KEY_FRIENDS, [])
  const idx = all.findIndex(f => f.id === requestId)
  if (idx !== -1) {
    all[idx].status = "accepted"
    write(KEY_FRIENDS, all)
  }
}
export function denyFriendRequest(requestId: string) {
  const all = read<Friendship[]>(KEY_FRIENDS, [])
  const next = all.filter(f => f.id !== requestId)
  write(KEY_FRIENDS, next)
}

// Conversations
function findOrCreateDM(a: string, b: string): Conversation {
  const convos = read<Conversation[]>(KEY_CONVOS, [])
  const sorted = [a, b].sort()
  const found = convos.find(c => c.memberIds.length === 2 && c.memberIds[0] === sorted[0] && c.memberIds[1] === sorted[1])
  if (found) return found
  const convo: Conversation = {
    id: crypto.randomUUID(),
    memberIds: sorted,
    lastMessageAt: null,
  }
  convos.push(convo)
  write(KEY_CONVOS, convos)
  return convo
}

export function listConversations(userId: string): Conversation[] {
  const convos = read<Conversation[]>(KEY_CONVOS, [])
  return convos.filter(c => c.memberIds.includes(userId)).sort((a,b)=>{
    if (!a.lastMessageAt && !b.lastMessageAt) return 0
    if (!a.lastMessageAt) return 1
    if (!b.lastMessageAt) return -1
    return a.lastMessageAt < b.lastMessageAt ? 1 : -1
  })
}

export function listMessages(conversationId: string): Message[] {
  const msgs = read<Message[]>(KEY_MESSAGES, [])
  return msgs.filter(m => m.conversationId === conversationId).sort((a,b)=> a.createdAt < b.createdAt ? -1 : 1)
}

export function sendMessageDM(fromId: string, toId: string, text: string): { conversation: Conversation; message: Message } {
  const convo = findOrCreateDM(fromId, toId)
  const msgs = read<Message[]>(KEY_MESSAGES, [])
  const message: Message = {
    id: crypto.randomUUID(),
    conversationId: convo.id,
    senderId: fromId,
    text,
    createdAt: new Date().toISOString(),
  }
  msgs.push(message)
  write(KEY_MESSAGES, msgs)
  // update convo
  const convos = read<Conversation[]>(KEY_CONVOS, [])
  const idx = convos.findIndex(c => c.id === convo.id)
  if (idx !== -1) {
    convos[idx].lastMessageAt = message.createdAt
    write(KEY_CONVOS, convos)
  }
  return { conversation: convo, message }
}
