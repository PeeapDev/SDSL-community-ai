"use client"

import { useEffect, useMemo, useState } from "react"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { getAllUsers, type MockUser } from "@/lib/mockUsers"
import { getOrCreateConversation, listConversations, listMessages, sendMessage } from "@/lib/chatStore"

export default function VendorChatPage() {
  const { userId } = useMockAuth()
  const me = userId || "v-001" // fallback demo

  const [selected, setSelected] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [tick, setTick] = useState(0)
  const [payOpen, setPayOpen] = useState(false)
  const [payAmount, setPayAmount] = useState("")
  const [payNote, setPayNote] = useState("")
  const [payError, setPayError] = useState<string>("")
  const [payLoading, setPayLoading] = useState(false)
  const [paySuccess, setPaySuccess] = useState<string>("")

  const users = useMemo(()=> getAllUsers().filter(u=>u.id!==me), [me])
  const conversations = useMemo(()=> me ? listConversations(me) : [], [me, tick])
  const convId = useMemo(()=> {
    if (!selected) return null
    return getOrCreateConversation(me, selected).id
  }, [me, selected])
  const messages = useMemo(()=> convId ? listMessages(convId) : [], [convId, tick])

  useEffect(()=>{
    const id = setInterval(()=> setTick(t=>t+1), 3000)
    return ()=> clearInterval(id)
  },[])

  function send() {
    if (!convId || !selected || !draft.trim()) return
    sendMessage(convId, me, selected, draft.trim())
    setDraft("")
    setTick(t=>t+1)
  }

  async function doPay() {
    if (!selected) return
    setPayError("")
    setPaySuccess("")
    const amt = parseFloat(payAmount)
    if (!(amt > 0)) { setPayError("Enter a valid amount"); return }
    try {
      setPayLoading(true)
      const res = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": me },
        body: JSON.stringify({ toUserId: selected, amount: amt, note: payNote || undefined })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")
      setPaySuccess("Payment sent")
      // Optionally drop a chat message
      if (convId) {
        sendMessage(convId, me, selected, `Paid $${amt.toFixed(2)}${payNote?` - ${payNote}`:""}`)
        setTick(t=>t+1)
      }
      setPayAmount("")
      setPayNote("")
      setTimeout(()=> setPayOpen(false), 600)
    } catch (e:any) {
      setPayError(e.message || "Payment failed")
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div className="grid md:grid-cols-[260px_1fr] gap-4 min-h-[70vh]">
      <aside className="rounded border border-slate-800 bg-slate-900/50">
        <div className="p-3 border-b border-slate-800 text-sm font-semibold">Conversations</div>
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-800">
          {conversations.map(c=>{
            const other = users.find(u=> u.id === (c.userA===me? c.userB : c.userA))
            if (!other) return null
            const active = selected===other.id
            return (
              <button key={c.id} onClick={()=>setSelected(other.id)} className={`w-full text-left px-3 py-2 ${active?"bg-slate-800":"hover:bg-slate-800/50"}`}>
                <div className="flex items-center gap-2">
                  <img src={other.avatarUrl || "/placeholder-user.jpg"} className="h-8 w-8 rounded-full border border-slate-700 object-cover" />
                  <div>
                    <div className="text-sm">{other.displayName}</div>
                    <div className="text-[11px] text-slate-500">@{other.username}</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <div className="p-3 border-t border-slate-800">
          <input list="all-users" placeholder="Start chat by username" className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" onChange={(e)=>{
            const uname = e.target.value.trim().toLowerCase()
            const u = users.find(x=>x.username.toLowerCase()===uname)
            if (u) setSelected(u.id)
          }} />
          <datalist id="all-users">
            {users.map(u=> <option key={u.id} value={u.username} />)}
          </datalist>
        </div>
      </aside>

      <section className="rounded border border-slate-800 bg-slate-900/50 flex flex-col">
        {!selected ? (
          <div className="m-auto text-slate-400 text-sm">Select a conversation or start a new one.</div>
        ) : (
          <>
            <div className="p-3 border-b border-slate-800 flex items-center gap-2">
              {(() => {
                const other = users.find(u=>u.id===selected) as MockUser
                return (
                  <div className="flex items-center gap-2">
                    <img src={other.avatarUrl || "/placeholder-user.jpg"} className="h-8 w-8 rounded-full border border-slate-700 object-cover" />
                    <div>
                      <div className="text-sm">{other.displayName}</div>
                      <div className="text-[11px] text-slate-500">@{other.username}</div>
                    </div>
                  </div>
                )
              })()}
              <div className="ml-auto flex items-center gap-2">
                <button onClick={()=>{ if(selected){ setPayOpen(true) } }} className="px-2 py-1.5 rounded bg-cyan-600 hover:bg-cyan-700 text-xs">Pay</button>
                <button onClick={()=>{ if (convId && selected) { sendMessage(convId, me, selected, "Payment request sent"); setTick(t=>t+1) } }} className="px-2 py-1.5 rounded border border-slate-700 text-xs hover:bg-slate-800">Request</button>
              </div>
            </div>
            <div className="flex-1 p-3 space-y-2 overflow-y-auto">
              {messages.map(m => (
                <div key={m.id} className={`max-w-[75%] ${m.fromUserId===me? "ml-auto text-right": ""}`}>
                  <div className={`inline-block px-3 py-2 rounded ${m.fromUserId===me? "bg-cyan-600": "bg-slate-800"}`}>{m.text}</div>
                  <div className="text-[10px] text-slate-500 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-800 flex gap-2">
              <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={(e)=>{ if (e.key==="Enter") send() }} placeholder="Type a message" className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" />
              <button onClick={send} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-sm">Send</button>
            </div>

            {/* Pay modal */}
            {payOpen && (
              <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="w-full max-w-sm rounded border border-slate-800 bg-slate-900 p-4">
                  <div className="text-sm font-semibold mb-2">Send Payment</div>
                  <div className="grid gap-2 text-sm">
                    <label className="text-slate-400">Amount (USD)</label>
                    <input value={payAmount} onChange={e=>setPayAmount(e.target.value)} placeholder="10.00" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                    <label className="text-slate-400 mt-2">Note (optional)</label>
                    <input value={payNote} onChange={e=>setPayNote(e.target.value)} placeholder="Service payment" className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
                  </div>
                  {payError && <div className="text-xs text-rose-400 mt-2">{payError}</div>}
                  {paySuccess && <div className="text-xs text-emerald-400 mt-2">{paySuccess}</div>}
                  <div className="mt-4 flex gap-2 justify-end">
                    <button onClick={()=>setPayOpen(false)} className="px-3 py-2 rounded border border-slate-700 text-sm">Cancel</button>
                    <button disabled={payLoading} onClick={doPay} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-sm disabled:opacity-60">{payLoading?"Paying...":"Pay"}</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
