// Mock groups/class communities store using localStorage
export interface Group {
  id: string
  name: string
  description?: string
  createdAt: number
  ownerId: string
}

export interface GroupMember { groupId: string; userId: string; joinedAt: number }

const GROUP_KEY = "groups_v1"
const MEMBER_KEY = "group_members_v1"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}
function write<T>(key: string, value: T) { if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value)) }

export function listGroups(): Group[] { return read<Group[]>(GROUP_KEY, []) }
export function listMembers(groupId: string): GroupMember[] {
  return read<GroupMember[]>(MEMBER_KEY, []).filter(m => m.groupId === groupId)
}
export function listMyGroups(userId: string): Group[] {
  const gs = listGroups()
  const mem = read<GroupMember[]>(MEMBER_KEY, []).filter(m => m.userId === userId).map(m => m.groupId)
  return gs.filter(g => mem.includes(g.id))
}

export function createGroup(ownerId: string, name: string, description?: string): Group {
  const groups = listGroups()
  const g: Group = { id: `grp_${Date.now()}`, name, description, createdAt: Date.now(), ownerId }
  write(GROUP_KEY, [g, ...groups])
  return g
}

export function joinGroup(groupId: string, userId: string) {
  const members = read<GroupMember[]>(MEMBER_KEY, [])
  if (members.some(m => m.groupId === groupId && m.userId === userId)) return
  members.push({ groupId, userId, joinedAt: Date.now() })
  write(MEMBER_KEY, members)
}
export function leaveGroup(groupId: string, userId: string) {
  const members = read<GroupMember[]>(MEMBER_KEY, [])
  write(MEMBER_KEY, members.filter(m => !(m.groupId === groupId && m.userId === userId)))
}

export function seedDemoGroups(ownerId: string) {
  const existing = listGroups()
  if (existing.length > 0) return
  const g1 = createGroup(ownerId, "Math Club", "Weekly problem-solving and competitions")
  const g2 = createGroup(ownerId, "Science League", "Prep for science fair and olympiads")
  const g3 = createGroup(ownerId, "History Circle", "Debates and history trivia")
  // Leave memberships empty; pages will allow join
}
