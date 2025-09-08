"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export type CardProduct = {
  id: string
  name: string
  type: string // e.g., gold, silver, platinum
  price: string // display price string for now (e.g., 9.99)
  imageUrl?: string
  active: boolean
}

const STORAGE_KEY = "admin_card_products"

export default function CardProductsPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<CardProduct[]>([])
  const [draft, setDraft] = useState<Partial<CardProduct>>({ type: "silver", active: true })

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  const canAdd = useMemo(() => (draft.name?.trim() && draft.type?.trim() && draft.price?.trim()), [draft])

  function addItem() {
    if (!canAdd) return
    const it: CardProduct = {
      id: crypto.randomUUID(),
      name: draft.name!.trim(),
      type: draft.type!.trim(),
      price: draft.price!.trim(),
      imageUrl: draft.imageUrl?.trim() || undefined,
      active: draft.active ?? true,
    }
    setItems(prev => [it, ...prev])
    setDraft({ type: draft.type || "silver", active: true })
    toast({ description: "Card product added" })
  }

  function remove(id: string) {
    setItems(prev => prev.filter(x => x.id !== id))
  }

  function toggleActive(id: string) {
    setItems(prev => prev.map(x => x.id === id ? { ...x, active: !x.active } : x))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Admin • Card Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* New product form */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="md:col-span-2">
                <Label>Name</Label>
                <Input value={draft.name || ""} onChange={(e)=>setDraft(d=>({...d, name: e.target.value}))} placeholder="Campus Gold" />
              </div>
              <div>
                <Label>Type</Label>
                <Input value={draft.type || ""} onChange={(e)=>setDraft(d=>({...d, type: e.target.value}))} placeholder="gold" />
              </div>
              <div>
                <Label>Price (USD)</Label>
                <Input value={draft.price || ""} onChange={(e)=>setDraft(d=>({...d, price: e.target.value}))} placeholder="9.99" />
              </div>
              <div>
                <Label>Image URL</Label>
                <Input value={draft.imageUrl || ""} onChange={(e)=>setDraft(d=>({...d, imageUrl: e.target.value}))} placeholder="https://.../card.png" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addItem} disabled={!canAdd}>Add Card Product</Button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {items.length === 0 && <div className="text-sm text-slate-400">No card products yet.</div>}
              {items.map((it) => (
                <div key={it.id} className="flex items-center gap-3 p-2 rounded border border-slate-700/60 bg-slate-900/40">
                  <div className="w-20 h-12 rounded overflow-hidden bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                    {it.imageUrl ? <img src={it.imageUrl} alt="card" className="max-w-full max-h-full" /> : <div className="text-[10px] text-slate-500">No Image</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-200 text-sm truncate">{it.name} <span className="text-slate-500">({it.type})</span></div>
                    <div className="text-slate-400 text-xs">${it.price} • {it.active ? "Active" : "Inactive"}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>toggleActive(it.id)}>{it.active ? "Deactivate" : "Activate"}</Button>
                    <Button size="sm" variant="destructive" onClick={()=>remove(it.id)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
