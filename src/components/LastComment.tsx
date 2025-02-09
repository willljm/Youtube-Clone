'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatTimeAgo } from '@/lib/utils'

interface LastCommentProps {
  videoId: string
}

export default function LastComment({ videoId }: LastCommentProps) {
  const [comment, setComment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLastComment() {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            user:users(
              id,
              full_name,
              avatar_url
            )
          `)
          .eq('video_id', videoId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error) throw error
        setComment(data)
      } catch (error) {
        console.error('Error fetching last comment:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLastComment()
  }, [videoId])

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-700 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-700 rounded w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!comment) {
    return (
      <p className="text-gray-400 text-sm">No hay comentarios aún</p>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <Image
        src={comment.user?.avatar_url || '/default-avatar.png'}
        alt={comment.user?.full_name || 'Usuario'}
        width={32}
        height={32}
        className="rounded-full"
      />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">
            {comment.user?.full_name}
          </span>
          <span className="text-gray-400 text-xs">
            {formatTimeAgo(comment.created_at)}
          </span>
        </div>
        <p className="text-white text-sm mt-1">
          {comment.content}
        </p>
      </div>
    </div>
  )
}
