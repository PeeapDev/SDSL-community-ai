// Mock notifications store per userId
export type Notification = {
  id: string
  userId: string
  title: string
  body?: string
  createdAt: number
  read: boolean
  type?: "order"|"message"|"system"|"product"
}

const KEY = "notifications_v1"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function write<T>(key: string, value: T) { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)) }

export function listNotifications(userId: string): Notification[] {
  return read<Notification[]>(KEY, []).filter(n=>n.userId===userId).sort((a,b)=>b.createdAt-a.createdAt)
}
export function pushNotification(n: Omit<Notification, "id"|"createdAt"|"read">) {
  const items = read<Notification[]>(KEY, [])
  const item: Notification = { ...n, id: `ntf_${Date.now()}`, createdAt: Date.now(), read: false }
  write(KEY, [item, ...items])
  return item
}
export function markRead(userId: string, id: string) {
  const items = read<Notification[]>(KEY, [])
  const idx = items.findIndex(m=>m.id===id && m.userId===userId)
  if (idx>=0) { items[idx].read = true; write(KEY, items) }
}
export function markAllRead(userId: string) {
  const items = read<Notification[]>(KEY, [])
  let changed=false
  for (const n of items) if (n.userId===userId && !n.read) { n.read = true; changed=true }
  if (changed) write(KEY, items)
}

export function seedNotifications(userId: string) {
  if (listNotifications(userId).length) return
  pushNotification({ userId, title: "Welcome to Campus AI!", type: "system" })
}
