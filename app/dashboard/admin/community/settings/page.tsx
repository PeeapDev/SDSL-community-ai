"use client"

import { useEffect, useState } from "react"
import { CommunitySettings, defaultSettings, getSettings, saveSettings } from "@/lib/communityStore"

export default function AdminCommunitySettingsPage() {
  const [s, setS] = useState<CommunitySettings>(getSettings())
  useEffect(()=>{ setS(getSettings()) },[])

  function toggle<K extends keyof CommunitySettings>(k: K) {
    setS(prev => ({ ...prev, [k]: !prev[k] as any }))
  }
  function onSave() { saveSettings(s) }
  function onReset() { const d = defaultSettings(); setS(d); saveSettings(d) }

  return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Community — Settings</h1>
        <p className="text-slate-400 mt-2">Admin settings for school community features (persisted locally).</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Posting</h2>
            <div className="mt-3 space-y-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.allowText} onChange={()=>toggle("allowText")} /> Allow Text Posts</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.allowImages} onChange={()=>toggle("allowImages")} /> Allow Images</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.allowVideos} onChange={()=>toggle("allowVideos")} /> Allow Videos (20s)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.allowComments} onChange={()=>toggle("allowComments")} /> Allow Comments</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.allowReactions} onChange={()=>toggle("allowReactions")} /> Allow Likes/Reactions</label>
            </div>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Safety & Censorship</h2>
            <div className="mt-3 space-y-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.bannedWords.length > 0} onChange={()=>setS(prev=>({...prev,bannedWords: prev.bannedWords.length? [] : ["badword"]}))} /> Enable Profanity Filter</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={true} readOnly /> Auto-flag Sensitive Media (future)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={true} readOnly /> Require Image Review for Students (future)</label>
              <div className="space-y-1">
                <div className="text-slate-300">Banned Words (comma-separated)</div>
                <input value={s.bannedWords.join(", ")} onChange={(e)=>setS(prev=>({...prev,bannedWords: e.target.value.split(",").map(w=>w.trim()).filter(Boolean)}))} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" placeholder="word1, word2" />
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Privacy</h2>
            <div className="mt-3 space-y-3 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.allowDMs} onChange={()=>toggle("allowDMs")} /> Allow DMs</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.allowStudentTags} onChange={()=>toggle("allowStudentTags")} /> Students can tag classmates</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={s.allowCrossSchool} onChange={()=>toggle("allowCrossSchool")} /> Allow cross-school visibility</label>
            </div>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
            <h2 className="font-semibold">Storage & Limits</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <div className="text-slate-300">Max Images/Post</div>
                <input type="number" value={s.maxImagesPerPost} onChange={(e)=>setS(prev=>({...prev,maxImagesPerPost: Number(e.target.value||0)}))} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <div className="text-slate-300">Max Video Length (sec)</div>
                <input type="number" value={s.maxVideoSeconds} onChange={(e)=>setS(prev=>({...prev,maxVideoSeconds: Number(e.target.value||0)}))} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <div className="text-slate-300">Max Upload Size (MB)</div>
                <input type="number" value={s.maxUploadMB} onChange={(e)=>setS(prev=>({...prev,maxUploadMB: Number(e.target.value||0)}))} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 md:col-span-2">
            <h2 className="font-semibold">Save</h2>
            <div className="mt-3 flex gap-3 text-sm">
              <button onClick={onSave} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700">Save Settings</button>
              <button onClick={onReset} className="px-4 py-2 rounded bg-slate-800 border border-slate-700">Reset Defaults</button>
            </div>
          </section>
        </div>
      </main>
  )
}
