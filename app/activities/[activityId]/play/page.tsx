"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ActivityRenderer from "@/components/activities/Renderer"
import { getActivity, type Activity } from "@/lib/mockStore"

export default function PlayActivityPage() {
  const params = useParams<{ activityId: string }>()
  const router = useRouter()
  const [activity, setActivity] = useState<Activity | null>(null)

  useEffect(() => {
    if (!params?.activityId) return
    const a = getActivity(params.activityId)
    if (!a) {
      router.replace("/dashboard/teacher")
      return
    }
    setActivity(a)
  }, [params?.activityId, router])

  if (!activity) return null
  return (
    <div>
      <ActivityRenderer spec={activity.spec} />
    </div>
  )
}
