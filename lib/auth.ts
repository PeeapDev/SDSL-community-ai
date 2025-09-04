"use client"

import { supabase } from "./supabaseClient"

export type Profile = {
  id: string
  role: "student" | "teacher" | "admin" | null
  display_name: string | null
  avatar_url: string | null
  metadata: Record<string, any> | null
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, display_name, avatar_url, metadata")
    .eq("id", user.id)
    .maybeSingle()
  if (error) {
    console.warn("getProfile error", error.message)
    return null
  }
  return data as Profile | null
}

export async function signOut() {
  await supabase.auth.signOut()
}
