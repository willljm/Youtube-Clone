'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import VideoEditor from '@/components/VideoEditor/VideoEditor'
import type { Video } from '@/types'

export default function EditorClient({ videoId }: { videoId: string }) {
  const { user } = useUser()
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)

  const loadVideo = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setVideo(data)
    } catch (error) {
      console.error('Error loading video:', error)
    } finally {
      setLoading(false)
    }
  }, [videoId, user])

  useEffect(() => {
    loadVideo()
  }, [loadVideo])

  if (loading || !video) {
    return null
  }

  return <VideoEditor video={video} />
}
