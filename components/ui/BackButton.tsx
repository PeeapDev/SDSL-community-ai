"use client"

import { useRouter } from "next/navigation"

export default function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter()
  function goBack() {
    // Try browser back; if no history, go home
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }
  return (
    <button
      onClick={goBack}
      className={
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-700/60 bg-slate-900/50 text-slate-200 hover:bg-slate-900 " +
        className
      }
      aria-label="Go back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path fillRule="evenodd" d="M10.03 3.97a.75.75 0 010 1.06L5.06 10h14.19a.75.75 0 010 1.5H5.06l4.97 4.97a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z" clipRule="evenodd" />
      </svg>
      <span>Back</span>
    </button>
  )
}
