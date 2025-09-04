"use client"

import { useMockAuth } from "@/components/providers/MockAuthProvider"

export type Role = "student" | "teacher" | "admin" | "vendor"

export type Visibility = "class" | "school" | "public"
export type PostStatus = "active" | "flagged" | "removed" | "pending_approval"

export type Post = {
  id: string
  authorId: string
  authorRole: Role
  text: string
  mediaUrls: string[]
  type: "text" | "image" | "video" | "embed"
  visibility: Visibility
  status: PostStatus
  createdAt: string
  likes: string[] // userIds
  commentCount: number
  tags?: string[]
}

export type Comment = {
  id: string
  postId: string
  userId: string
  text: string
  parentId?: string | null
  createdAt: string
  status: "active" | "removed"
}

export type Report = {
  id: string
  targetType: "post" | "comment"
  targetId: string
  reason: string
  reporterId: string
  status: "open" | "approved" | "removed" | "dismissed"
  createdAt: string
}

export type CommunitySettings = {
  allowText: boolean
  allowImages: boolean
  allowVideos: boolean
  allowComments: boolean
  allowReactions: boolean
  allowDMs: boolean
  allowStudentTags: boolean
  allowCrossSchool: boolean
  bannedWords: string[]
  maxImagesPerPost: number
  maxVideoSeconds: number
  maxUploadMB: number
}

const KEY_POSTS = "community_posts"
const KEY_COMMENTS = "community_comments"
const KEY_REPORTS = "community_reports"
const KEY_SETTINGS = "community_settings"

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const val = JSON.parse(raw)
    return val as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function defaultSettings(): CommunitySettings {
  return {
    allowText: true,
    allowImages: true,
    allowVideos: true,
    allowComments: true,
    allowReactions: true,
    allowDMs: true,
    allowStudentTags: true,
    allowCrossSchool: false,
    bannedWords: [],
    maxImagesPerPost: 4,
    maxVideoSeconds: 20,
    maxUploadMB: 25,
  }
}

export function getSettings(): CommunitySettings {
  return read<CommunitySettings>(KEY_SETTINGS, defaultSettings())
}

export function saveSettings(s: CommunitySettings) {
  write(KEY_SETTINGS, s)
}

export function listPosts(): Post[] {
  const posts = read<Post[]>(KEY_POSTS, [])
  return posts.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function createPost(input: Omit<Post, "id" | "createdAt" | "likes" | "commentCount" | "status"> & { status?: PostStatus }): Post {
  const s = getSettings()
  // basic allow checks
  if (input.type === "text" && !s.allowText) throw new Error("Text posts disabled")
  if (input.type === "image" && !s.allowImages) throw new Error("Image posts disabled")
  if (input.type === "video" && !s.allowVideos) throw new Error("Video posts disabled")

  const post: Post = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    likes: [],
    commentCount: 0,
    status: input.status ?? "active",
    ...input,
  }
  const posts = read<Post[]>(KEY_POSTS, [])
  posts.push(post)
  write(KEY_POSTS, posts)
  return post
}

export function toggleLike(postId: string, userId: string): Post | null {
  const posts = read<Post[]>(KEY_POSTS, [])
  const idx = posts.findIndex(p => p.id === postId)
  if (idx === -1) return null
  const set = new Set(posts[idx].likes)
  if (set.has(userId)) set.delete(userId)
  else set.add(userId)
  posts[idx].likes = Array.from(set)
  write(KEY_POSTS, posts)
  return posts[idx]
}

export function listComments(postId: string): Comment[] {
  const all = read<Comment[]>(KEY_COMMENTS, [])
  return all.filter(c => c.postId === postId && c.status === "active").sort((a,b)=> (a.createdAt < b.createdAt ? -1 : 1))
}

export function addComment(postId: string, userId: string, text: string, parentId?: string | null): Comment {
  const comment: Comment = {
    id: crypto.randomUUID(),
    postId,
    userId,
    text,
    parentId: parentId ?? null,
    createdAt: new Date().toISOString(),
    status: "active",
  }
  const comments = read<Comment[]>(KEY_COMMENTS, [])
  comments.push(comment)
  write(KEY_COMMENTS, comments)

  // increment post counter
  const posts = read<Post[]>(KEY_POSTS, [])
  const idx = posts.findIndex(p => p.id === postId)
  if (idx !== -1) {
    posts[idx].commentCount += 1
    write(KEY_POSTS, posts)
  }
  return comment
}

export function reportPost(postId: string, reporterId: string, reason: string): Report {
  const report: Report = {
    id: crypto.randomUUID(),
    targetType: "post",
    targetId: postId,
    reason,
    reporterId,
    status: "open",
    createdAt: new Date().toISOString(),
  }
  const reports = read<Report[]>(KEY_REPORTS, [])
  reports.push(report)
  write(KEY_REPORTS, reports)

  // set post flagged
  const posts = read<Post[]>(KEY_POSTS, [])
  const idx = posts.findIndex(p => p.id === postId)
  if (idx !== -1) {
    posts[idx].status = "flagged"
    write(KEY_POSTS, posts)
  }
  return report
}

export function listReports(): Report[] {
  return read<Report[]>(KEY_REPORTS, []).sort((a,b)=> (a.createdAt < b.createdAt ? 1 : -1))
}

export function moderateReport(reportId: string, action: "approve" | "remove" | "dismiss" | "banUser") {
  const reports = read<Report[]>(KEY_REPORTS, [])
  const posts = read<Post[]>(KEY_POSTS, [])
  const idx = reports.findIndex(r => r.id === reportId)
  if (idx === -1) return
  const r = reports[idx]
  if (r.targetType === "post") {
    const pIdx = posts.findIndex(p => p.id === r.targetId)
    if (pIdx !== -1) {
      if (action === "approve") posts[pIdx].status = "active"
      if (action === "remove") posts[pIdx].status = "removed"
      if (action === "dismiss") posts[pIdx].status = posts[pIdx].status === "removed" ? "removed" : "active"
      // banUser is a no-op in mock; would mark author's account in real backend
      write(KEY_POSTS, posts)
    }
  }
  reports[idx].status = action === "dismiss" ? "dismissed" : action === "approve" ? "approved" : "removed"
  write(KEY_REPORTS, reports)
}
