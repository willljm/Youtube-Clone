'use client'

import { useEffect, useState } from 'react'

export default function VideoSkeleton({ variant = 'default' }: { variant?: 'default' | 'search' }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (variant === 'search') {
    return (
      <div className="flex gap-4 animate-pulse p-2">
        <div className="w-[400px] aspect-video rounded-xl bg-zinc-800 flex-shrink-0" />
        <div className="flex-grow py-1">
          <div className="h-6 bg-zinc-800 rounded w-3/4 mb-2" />
          <div className="h-6 bg-zinc-800 rounded w-1/2 mb-4" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800" />
            <div className="h-4 bg-zinc-800 rounded w-32" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-zinc-800 rounded-xl mb-4" />
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-800" />
        <div className="flex-1">
          <div className="h-4 bg-zinc-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    </div>
  )
}
