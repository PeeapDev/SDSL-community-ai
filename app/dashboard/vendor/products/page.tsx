"use client"

import { useEffect, useMemo, useState } from "react"
import { createProduct, listProductsByVendor, seedDemoProducts, type Product, type ProductVariant } from "@/lib/productStore"

export default function VendorProductsPage() {
  const vendorId = "v-001" // demo vendor id for mock
  const [items, setItems] = useState<Product[]>([])
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState<number>(19.99)
  const [stock, setStock] = useState<number>(10)
  const [imageUrl, setImageUrl] = useState("")
  const [description, setDescription] = useState("")
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [variantName, setVariantName] = useState("")
  const [variantPrice, setVariantPrice] = useState<number>(19.99)
  const [variantStock, setVariantStock] = useState<number>(0)

  function refresh() {
    setItems(listProductsByVendor(vendorId))
  }

  useEffect(() => {
    try { seedDemoProducts() } catch {}
    refresh()
  }, [])

  function addVariant() {
    if (!variantName.trim()) return
    const v: ProductVariant = { id: `${Date.now()}`, name: variantName.trim(), price: variantPrice, stock: variantStock }
    setVariants(prev => [...prev, v])
    setVariantName("")
    setVariantPrice(price)
    setVariantStock(0)
  }

  function removeVariant(id: string) {
    setVariants(prev => prev.filter(v => v.id !== id))
  }

  function onCreate() {
    const t = title.trim()
    if (!t) return
    createProduct({ vendorId, title: t, price, stock, imageUrl: imageUrl || "/placeholder.jpg", description: description.trim() || undefined, variants: variants.length? variants: undefined })
    setTitle("")
    setPrice(19.99)
    setStock(10)
    setImageUrl("")
    setDescription("")
    setVariants([])
    refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Products</h1>
        <p className="text-slate-400 mt-2">Add and manage your catalog.</p>
      </div>

      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="font-semibold">Add Product</h2>
        <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
          <div className="grid gap-1">
            <label className="text-slate-400">Title</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" placeholder="e.g., School Hoodie" />
          </div>
          <div className="grid gap-1">
            <label className="text-slate-400">Image URL</label>
            <input value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" placeholder="/placeholder.jpg" />
          </div>
          <div className="grid gap-1">
            <label className="text-slate-400">Price</label>
            <input type="number" min={0} step="0.01" value={price} onChange={(e)=>setPrice(parseFloat(e.target.value||"0"))} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
          </div>
          <div className="grid gap-1">
            <label className="text-slate-400">Stock</label>
            <input type="number" min={0} value={stock} onChange={(e)=>setStock(parseInt(e.target.value||"0"))} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2 grid gap-1">
            <label className="text-slate-400">Description</label>
            <textarea value={description} onChange={(e)=>setDescription(e.target.value)} rows={3} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" placeholder="Optional details" />
          </div>
        </div>

        {/* Variants */}
        <div className="mt-4">
          <div className="text-sm font-medium">Variants</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map(v => (
              <div key={v.id} className="flex items-center gap-2 text-xs bg-slate-950 border border-slate-800 rounded px-2 py-1">
                <span>{v.name}</span>
                <span>${v.price.toFixed(2)}</span>
                <span>stock {v.stock}</span>
                <button onClick={()=>removeVariant(v.id)} className="text-slate-400 hover:text-white">✕</button>
              </div>
            ))}
          </div>
          <div className="mt-2 grid md:grid-cols-3 gap-2 text-sm">
            <input value={variantName} onChange={(e)=>setVariantName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" placeholder="Variant name (e.g., Small)" />
            <input type="number" min={0} step="0.01" value={variantPrice} onChange={(e)=>setVariantPrice(parseFloat(e.target.value||"0"))} className="bg-slate-950 border border-slate-800 rounded px-3 py-2" placeholder="Price" />
            <div className="flex gap-2">
              <input type="number" min={0} value={variantStock} onChange={(e)=>setVariantStock(parseInt(e.target.value||"0"))} className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2" placeholder="Stock" />
              <button onClick={addVariant} className="px-3 py-2 rounded bg-slate-800 border border-slate-700">Add</button>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onCreate} disabled={!title.trim()} className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50">Create</button>
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
        <h2 className="font-semibold">Your Products</h2>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          {items.map(p => (
            <div key={p.id} className="rounded border border-slate-800 bg-slate-950/50 p-3">
              <img src={p.imageUrl||"/placeholder.jpg"} className="h-28 w-full object-cover rounded" />
              <div className="mt-2 text-sm font-medium">{p.title}</div>
              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>${p.price.toFixed(2)}</span>
                <span>stock {p.stock}</span>
              </div>
              {p.variants?.length ? (
                <div className="mt-2 text-xs text-slate-400">{p.variants.length} variant(s)</div>
              ) : null}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-sm text-slate-400">No products yet.</div>
          )}
        </div>
      </section>
    </div>
  )
}
