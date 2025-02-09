'use client'

import { useState, useEffect } from 'react'
import { supabase, setupStorageBuckets } from '@/lib/supabase'
import VideoCard from '@/components/VideoCard'
import { VideoSkeleton } from '@/components/Skeleton'
import { useUser } from '@/hooks/useUser'
import FilterSlider from '@/components/FilterSlider'
import { useLayoutStore } from '@/store/useLayoutStore' // Añadir este import

interface Video {
  id: string
  title: string
  thumbnail_url: string | null
  url: string
  public_url?: string
  views: number
  created_at: string
  user_id: string
  profiles?: {
    id: string
    full_name: string
    avatar_url: string
  }
  isSubscribed?: boolean
}

export default function Home() {
  const { user } = useUser()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isExpanded = useLayoutStore((state) => state.isSidebarExpanded)

  useEffect(() => {
    setupStorageBuckets().then(() => {
      console.log('Bucket configurado')
      fetchVideos()
    })
  }, [user])

  const fetchVideos = async () => {
    try {
      console.log('Iniciando fetchVideos')
      setLoading(true)
      setError(null) // Resetear error al inicio

      // Obtener los videos
      const { data: videosData, error: videosError } = await supabase
        .from('videos')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (videosError) {
        console.error('Error detallado:', videosError)
        throw new Error(videosError.message)
      }

      if (!videosData) {
        throw new Error('No se recibieron datos')
      }

      // Si hay un usuario logueado, obtener sus suscripciones
      let subscriptions: Record<string, boolean> = {}
      if (user) {
        const { data: subs, error: subsError } = await supabase
          .from('subscriptions')
          .select('channel_id')
          .eq('user_id', user.id)

        if (!subsError && subs) {
          subscriptions = subs.reduce((acc, sub) => {
            acc[sub.channel_id] = true
            return acc
          }, {} as Record<string, boolean>)
        }
      }

      const processedVideos = await Promise.all((videosData || []).map(async (video) => {
        let publicUrl = video.public_url

        if (!publicUrl) {
          const { data: publicUrlData } = supabase.storage
            .from('videos')
            .getPublicUrl(video.url)
          
          publicUrl = publicUrlData?.publicUrl
        }

        return {
          ...video,
          public_url: publicUrl,
          profiles: video.profiles ? {
            id: video.profiles.id,
            full_name: video.profiles.full_name || 'Usuario',
            avatar_url: video.profiles.avatar_url || '/default-avatar.png'
          } : undefined,
          isSubscribed: user ? subscriptions[video.profiles?.id || ''] || false : false
        }
      }))

      console.log('Videos procesados:', processedVideos)
      setVideos(processedVideos)
      setLoading(false)
    } catch (error: any) {
      console.error('Error completo:', error)
      setError(error.message || 'Error al cargar los videos')
      setLoading(false)
    }
  }

  return (
    <div className={`
      min-h-screen bg-[#0f0f0f] 
      transition-all duration-300
      ${isExpanded ? 'md:ml-60' : 'md:ml-20'}
    `}>
      <div className="relative z-40 pb-6 top-1">
        <FilterSlider />
      </div>
      <div className="grid grid-cols-1 px-4 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-3">
        {loading ? (
          Array(8).fill(0).map((_, i) => (
            <VideoSkeleton key={i} />
          ))
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : videos.length === 0 ? (
          <div className="text-white">No hay videos disponibles.</div>
        ) : (
          videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              channel={video.profiles}
            />
          ))
        )}
      </div>
    </div>
  )
}
