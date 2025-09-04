"use client"

import { useEffect, useState } from "react"
import MockRoleGuard from "@/components/layouts/MockRoleGuard"
import { useMockAuth } from "@/components/providers/MockAuthProvider"
import { addComment, createPost, defaultSettings, getSettings, listComments, listPosts, reportPost, toggleLike, type Post } from "@/lib/communityStore"
import { getUserById } from "@/lib/mockUsers"
import { getProductById, listNewProducts, listRecentProducts, seedDemoProducts } from "@/lib/productStore"

export default function AdminCommunityFeedPage() {
  const { userId, role } = useMockAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [allow, setAllow] = useState(getSettings())
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [openModal, setOpenModal] = useState(false)
  const [modalText, setModalText] = useState("")
  const [newProducts, setNewProducts] = useState(() => listNewProducts(6))
  const [recentProducts, setRecentProducts] = useState(() => listRecentProducts(6))
  const [showCarousel, setShowCarousel] = useState(false)
  const [scrollCount, setScrollCount] = useState(0)
  const [nextTrigger, setNextTrigger] = useState<number>([5,7,10][Math.floor(Math.random()*3)])
  const [selectedProductId, setSelectedProductId] = useState<string|null>(null)
  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null
  const [selectedVariantId, setSelectedVariantId] = useState<string|undefined>(undefined)

  function refresh() {
    setAllow(getSettings())
    setPosts(listPosts().filter(p => p.status !== "removed"))
    setNewProducts(listNewProducts(6))
    setRecentProducts(listRecentProducts(6))
  }

  useEffect(() => {
    // Seed demo posts once if empty
    const existing = listPosts()
    if (existing.length === 0) {
      try {
        createPost({ authorId: "t-001", authorRole: "teacher", text: "Welcome to the school feed! 🎉", mediaUrls: [], type: "text", visibility: "school" })
        createPost({ authorId: "s-001", authorRole: "student", text: "Anyone up for study group this Friday?", mediaUrls: [], type: "text", visibility: "school" })
        createPost({ authorId: "admin-1", authorRole: "admin", text: "Reminder: Science fair submissions due next week.", mediaUrls: [], type: "text", visibility: "school" })
      } catch {}
    }
    // Seed products for vendor sidebar
    try { seedDemoProducts() } catch {}
    refresh()
  }, [])

  useEffect(() => {
    function onScroll() {
      setScrollCount((c) => {
        const next = c + 1
        if (next >= nextTrigger) {
          setShowCarousel(true)
          setTimeout(()=> setShowCarousel(false), 5000)
          setNextTrigger([5,7,10][Math.floor(Math.random()*3)])
          return 0
        }
        return next
      })
    }
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [nextTrigger])

  // create via modal only

  function onCreateFromModal() {
    if (!userId || !allow.allowText) return
    const trimmed = modalText.trim()
    if (!trimmed) return
    createPost({ authorId: userId, authorRole: role, text: trimmed, mediaUrls: [], type: "text", visibility: "school" })
    setModalText("")
    setOpenModal(false)
    refresh()
  }

  function onToggleLike(id: string) {
    if (!userId) return
    toggleLike(id, userId)
    refresh()
  }

  function onAddComment(postId: string) {
    if (!userId || !allow.allowComments) return
    const txt = (commentDrafts[postId] ?? "").trim()
    if (!txt) return
    addComment(postId, userId, txt)
    setCommentDrafts((prev) => ({ ...prev, [postId]: "" }))
    refresh()
  }

  function onReport(postId: string) {
    if (!userId) return
    const reason = prompt("Reason for report?", "inappropriate content") || "report"
    reportPost(postId, userId, reason)
    refresh()
  }

  return (
    <MockRoleGuard allow={["admin","teacher","student"]}>
      <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Community — Feed</h1>
            <p className="text-slate-400 mt-2">School-wide social feed. Create text posts, like, comment, and report (mock, local only).</p>
          </div>
          <button onClick={()=>setOpenModal(true)} className="px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-700">Create Post</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-3">
            {posts.length === 0 && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-sm text-slate-400">No posts yet.</div>
            )}
            {posts.map((p) => (
              <article key={p.id} className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <img src={(getUserById(p.authorId)?.avatarUrl)||"/placeholder-user.jpg"} alt="" className="h-7 w-7 rounded-full object-cover" />
                    <div className="text-slate-300">{getUserById(p.authorId)?.displayName || p.authorRole}</div>
                    <div className="text-slate-600">@{getUserById(p.authorId)?.username || p.authorId}</div>
                  </div>
                  <div>{new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="mt-2 text-sm whitespace-pre-wrap">{p.text}</div>
                {p.status === "flagged" && <div className="mt-2 text-xs text-amber-400">Flagged, pending review</div>}
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <button onClick={()=>onToggleLike(p.id)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Like ({p.likes.length})</button>
                  <span className="text-slate-500">Comments: {p.commentCount}</span>
                  <button onClick={()=>onReport(p.id)} className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Report</button>
                </div>
                {/* quick comment */}
                <div className="mt-3 flex gap-2">
                  <input value={commentDrafts[p.id] ?? ""} onChange={(e)=>setCommentDrafts(prev=>({...prev,[p.id]:e.target.value}))} placeholder="Write a comment..." className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm" />
                  <button onClick={()=>onAddComment(p.id)} disabled={!allow.allowComments} className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700 disabled:opacity-50">Reply</button>
                </div>
              </article>
            ))}
          </div>
          {/* Right vendor products rail */}
          <aside className="md:col-span-1 space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">New</div>
              <div className="space-y-2">
                {newProducts.map(p => (
                  <button key={p.id} onClick={()=>setSelectedProductId(p.id)} className="w-full text-left flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded px-2 py-2 hover:bg-slate-900/70">
                    <img src={p.imageUrl||"/placeholder.jpg"} alt="" className="h-10 w-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm">{p.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>${p.price.toFixed(2)}</span>
                        {p.sponsored && <span className="text-[10px] text-amber-400 border border-amber-400/30 rounded px-1 py-0.5">Sponsored</span>}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-cyan-600">View</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">Recent</div>
              <div className="space-y-2">
                {recentProducts.map(p => (
                  <button key={p.id} onClick={()=>setSelectedProductId(p.id)} className="w-full text-left flex items-center justify-between gap-3 bg-slate-950/60 border border-slate-800 rounded px-2 py-2 hover:bg-slate-900/70">
                    <img src={p.imageUrl||"/placeholder.jpg"} alt="" className="h-10 w-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm">{p.title}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>${p.price.toFixed(2)}</span>
                        {p.sponsored && <span className="text-[10px] text-amber-400 border border-amber-400/30 rounded px-1 py-0.5">Sponsored</span>}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">View</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {openModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={()=>setOpenModal(false)} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-lg p-4 w-full max-w-lg">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Create Post</h3>
                <button onClick={()=>setOpenModal(false)} className="text-slate-400 hover:text-slate-200">✕</button>
              </div>
              <textarea value={modalText} onChange={(e)=>setModalText(e.target.value)} placeholder="What's on your mind?" className="mt-3 w-full h-32 bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm" />
              <div className="mt-3 flex justify-end gap-2">
                <button onClick={()=>setOpenModal(false)} className="px-3 py-1.5 rounded bg-slate-800 border border-slate-700">Cancel</button>
                <button onClick={onCreateFromModal} disabled={!allow.allowText || !modalText.trim()} className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50">Post</button>
              </div>
            </div>
          </div>
        )}

        {showCarousel && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[min(96vw,900px)]">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 overflow-x-auto">
              <div className="flex gap-3">
                {listRecentProducts(10).map(p => (
                  <button key={p.id} onClick={()=>setSelectedProductId(p.id)} className="text-left min-w-[180px] bg-slate-950/60 border border-slate-800 rounded p-2 hover:bg-slate-900/60">
                    <img src={p.imageUrl||"/placeholder.jpg"} className="h-28 w-full object-cover rounded" />
                    <div className="mt-2 text-sm truncate">{p.title}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>${p.price.toFixed(2)}</span>
                      {p.sponsored && <span className="text-[10px] text-amber-400 border border-amber-400/30 rounded px-1 py-0.5">Sponsored</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Product modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={()=>{setSelectedProductId(null); setSelectedVariantId(undefined)}} />
            <div className="relative bg-slate-900 border border-slate-800 rounded-lg w-full max-w-3xl overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Gallery */}
                <div className="md:w-1/2 p-4 border-b md:border-b-0 md:border-r border-slate-800">
                  <div className="aspect-square rounded overflow-hidden bg-slate-950">
                    <img src={(selectedProduct.images?.[0]) || selectedProduct.imageUrl || "/placeholder.jpg"} className="w-full h-full object-cover" />
                  </div>
                  {selectedProduct.images?.length ? (
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {selectedProduct.images.map((img, i)=> (
                        <img key={i} src={img} className="h-14 w-14 object-cover rounded border border-slate-800" />
                      ))}
                    </div>
                  ) : null}
                </div>
                {/* Info */}
                <div className="md:w-1/2 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{selectedProduct.title}</h3>
                    <button onClick={()=>{setSelectedProductId(null); setSelectedVariantId(undefined)}} className="text-slate-400 hover:text-slate-200">✕</button>
                  </div>
                  <div className="text-sm text-slate-400 mt-1">${selectedProduct.price.toFixed(2)}</div>
                  {selectedProduct.sponsored && <div className="mt-1 text-[10px] text-amber-400 border border-amber-400/30 inline-block rounded px-1 py-0.5">Sponsored</div>}
                  {selectedProduct.description && <p className="mt-3 text-sm text-slate-300">{selectedProduct.description}</p>}
                  {/* Variants */}
                  {selectedProduct.variants?.length ? (
                    <div className="mt-4">
                      <div className="text-xs text-slate-400">Select Variant</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedProduct.variants.map(v => (
                          <button key={v.id} onClick={()=>setSelectedVariantId(v.id)} className={`text-xs px-2 py-1 rounded border ${selectedVariantId===v.id?"bg-cyan-600 border-cyan-500":"bg-slate-900 border-slate-800"}`}>
                            {v.name} · ${v.price.toFixed(2)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <div className="mt-6 flex items-center gap-2">
                    <button className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700">Buy</button>
                    <a href="/dashboard/admin/community/messages" className="px-4 py-2 rounded bg-slate-800 border border-slate-700">Chat</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </MockRoleGuard>
  )
}

