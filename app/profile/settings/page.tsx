"use client"

import { useEffect, useState } from "react"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { getProfile, updateProfile, type Profile } from "@/lib/profileStore"

export default function ProfileSettingsPage() {
  const { userId } = useMockAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatar, setAvatar] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [handle, setHandle] = useState("")
  const [blockTagging, setBlockTagging] = useState(false)
  const [requireGroupConsent, setRequireGroupConsent] = useState(true)
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return
    const p = getProfile(userId)
    setProfile(p)
    setAvatar(p.avatarUrl ?? "")
    setDisplayName(p.displayName ?? "")
    setBlockTagging(p.social.blockTagging)
    setRequireGroupConsent(p.social.requireGroupConsent)

    // Fetch existing directory info from backend (display_name/handle)
    fetch("/api/user/directory", { headers: { "x-user-id": userId } })
      .then(async (r) => r.json())
      .then((res) => {
        if (res?.user) {
          if (res.user.display_name) setDisplayName(res.user.display_name)
          if (res.user.handle) setHandle(res.user.handle)
        }
      })
      .catch(() => {})
  }, [userId])

  async function onSave() {
    if (!userId) return
    setSaving(true)
    setStatus(null)
    try {
      // Update user_directory display_name (and handle if provided)
      const res = await fetch("/api/user/directory", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ displayName, handle: handle || undefined }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Failed to update profile")

      // Keep local profile store for avatar and social prefs
      const next = updateProfile(userId, {
        avatarUrl: avatar || undefined,
        displayName: displayName || undefined,
        social: { blockTagging, requireGroupConsent },
      })
      setProfile(next)
      setStatus("Saved")
    } catch (e: any) {
      setStatus(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <MockRoleGuard allow={["student","teacher","admin"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-slate-400 mt-2">Update your profile image, password (stub), and social preferences.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Profile</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-slate-300 mb-1">Handle</div>
                <input value={handle} onChange={(e)=>setHandle(e.target.value)} placeholder="e.g. alex" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
                <div className="text-xs text-slate-500 mt-1">Lowercase letters, numbers, underscore. Shown as @handle.</div>
              </div>
              <div>
                <div className="text-slate-300 mb-1">Display Name</div>
                <input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} placeholder="e.g. Alex" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
              </div>
              <div>
                <div className="text-slate-300 mb-1">Avatar URL</div>
                <input value={avatar} onChange={(e)=>setAvatar(e.target.value)} placeholder="https://..." className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
                <div className="mt-3 flex items-center gap-3">
                  <img src={avatar || "/placeholder-user.jpg"} alt="avatar" className="h-12 w-12 rounded-full border border-slate-700 object-cover" />
                  <div className="text-xs text-slate-500">Preview</div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Security</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-slate-300 mb-1">New Password</div>
                <input value={password} onChange={(e)=>setPassword(e.target.value)} type="password" placeholder="••••••••" className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2" />
                <div className="text-xs text-slate-500 mt-1">Password change is a mock in this build.</div>
              </div>
              <div className="flex items-center gap-2">
                <input id="tagging" type="checkbox" className="accent-cyan-500" checked={blockTagging} onChange={(e)=>setBlockTagging(e.target.checked)} />
                <label htmlFor="tagging" className="text-slate-300">Block others from tagging me</label>
              </div>
              <div className="flex items-center gap-2">
                <input id="consent" type="checkbox" className="accent-cyan-500" checked={requireGroupConsent} onChange={(e)=>setRequireGroupConsent(e.target.checked)} />
                <label htmlFor="consent" className="text-slate-300">Require my consent to be added to groups</label>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={onSave} disabled={saving} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50">{saving ? "Saving..." : "Save Changes"}</button>
          {status && <span className="text-sm text-slate-400">{status}</span>}
        </div>
      </main>
    </MockRoleGuard>
  )
}
