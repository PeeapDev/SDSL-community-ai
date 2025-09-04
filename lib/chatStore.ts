// Minimal chat store for vendor to chat with all roles
export type ChatMessage = {
  id: string
  convId: string
  fromUserId: string
  toUserId: string
  text: string
  createdAt: number
}

export type Conversation = {
  id: string
  userA: string
  userB: string
  lastMessageAt: number
}

const CHAT_MSG_KEY = "chat_messages_v1"
const CHAT_CONV_KEY = "chat_conversations_v1"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function write<T>(key: string, value: T) { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)) }

export function listConversations(userId: string): Conversation[] {
  return read<Conversation[]>(CHAT_CONV_KEY, []).filter(c=> c.userA===userId || c.userB===userId).sort((a,b)=>b.lastMessageAt-a.lastMessageAt)
}

export function getOrCreateConversation(userA: string, userB: string): Conversation {
  const all = read<Conversation[]>(CHAT_CONV_KEY, [])
  let c = all.find(x => (x.userA===userA && x.userB===userB) || (x.userA===userB && x.userB===userA))
  if (!c) { c = { id: `cv_${Date.now()}`, userA, userB, lastMessageAt: Date.now() }; write(CHAT_CONV_KEY, [c, ...all]) }
  return c
}

export function listMessages(convId: string): ChatMessage[] {
  return read<ChatMessage[]>(CHAT_MSG_KEY, []).filter(m=>m.convId===convId).sort((a,b)=>a.createdAt-b.createdAt)
}

export function sendMessage(convId: string, fromUserId: string, toUserId: string, text: string): ChatMessage {
  const msg: ChatMessage = { id: `m_${Date.now()}`, convId, fromUserId, toUserId, text, createdAt: Date.now() }
  const msgs = read<ChatMessage[]>(CHAT_MSG_KEY, [])
  write(CHAT_MSG_KEY, [...msgs, msg])
  const convs = read<Conversation[]>(CHAT_CONV_KEY, [])
  const idx = convs.findIndex(c=>c.id===convId)
  if (idx>=0) { convs[idx].lastMessageAt = msg.createdAt; write(CHAT_CONV_KEY, convs) }
  return msg
}
