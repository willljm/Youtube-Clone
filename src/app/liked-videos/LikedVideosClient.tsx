'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import VideoCard from '@/components/VideoCard'
import { ThumbsUp } from 'lucide-react'

interface LikedVideo {
  id: string
  title: string
  description: string
  thumbnail_url: string
  url: string
  view_count: number
  created_at: string
  user: {
    id: string
    username: string
    avatar_url: string
  }
}

export default function LikedVideosClient() {
  const { user } = useUser()
  const [videos, setVideos] = useState<LikedVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLikedVideos() {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('videos')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            url,
            view_count,
            created_at,
            user:user_id (
              id,
              username,
              avatar_url
            )
          `)
          .in('id', (
            supabase
              .from('video_likes')
              .select('video_id')
              .eq('user_id', user.id)
          ))
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error details:', error)
          throw error
        }

        setVideos(data || [])
      } catch (error) {
        console.error('Error fetching liked videos:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLikedVideos()
  }, [user])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <ThumbsUp className="w-16 h-16 text-zinc-500" />
        <h1 className="text-2xl font-bold text-zinc-100">Inicia sesión para ver tus videos favoritos</h1>
        <p className="text-center text-zinc-400">
          Los videos que marques con &quot;Me gusta&quot; aparecerán aquí
        </p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <ThumbsUp className="w-16 h-16 text-zinc-500" />
        <h1 className="text-2xl font-bold text-zinc-100">Aún no hay videos que te gusten</h1>
        <p className="text-center text-zinc-400">
          Los videos que marques con &quot;Me gusta&quot; aparecerán aquí
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="px-8 py-4 mx-auto max-w-screen-2xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-zinc-800">
            <ThumbsUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Videos que me gustan</h1>
            <p className="text-zinc-400">{videos.length} videos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              channel={video.user}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
