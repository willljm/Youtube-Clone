'use client'

import { useEffect, useState } from 'react'
import { getWatchLater } from '@/lib/playlist'
import { useUser } from '@/hooks/useUser'
import { VideoSkeleton } from '@/components/Skeleton'
import VideoCard from '@/components/VideoCard'
import { Clock } from 'lucide-react'
import Image from 'next/image'
import { formatTimeAgo, formatViewCount } from '@/lib/utils'
import { useLayoutStore } from '@/stores/layoutStore' // Corregida la importación

export default function WatchLaterPage() {
  const { user } = useUser()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const isExpanded = useLayoutStore((state) => state.isSidebarExpanded)

  useEffect(() => {
    async function loadVideos() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log('Loading watch later videos for user:', user.id);
        const watchLaterVideos = await getWatchLater(user.id)
        console.log('Watch later videos loaded:', watchLaterVideos);
        setVideos(watchLaterVideos)
      } catch (error) {
        console.error('Error loading watch later:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [user])

  return (
    <div className={`
      min-h-screen bg-[#0f0f0f] 
      transition-all duration-300
      ${isExpanded ? 'md:pl-60' : 'md:pl-20'}
    `}>
      {/* Header con gradiente */}
      <div className="relative h-48 md:h-64 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative h-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-end h-full pb-6 md:pb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-lg bg-zinc-800/50 backdrop-blur">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Ver más tarde</h1>
                <p className="text-zinc-300 text-sm md:text-base">{videos.length} videos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Clock className="w-16 h-16 text-zinc-500" />
            <h2 className="text-xl md:text-2xl font-bold text-zinc-100">
              Inicia sesión para ver tus videos guardados
            </h2>
            <p className="text-center text-zinc-400">
              Los videos que guardes aparecerán aquí
            </p>
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Clock className="w-16 h-16 text-zinc-500" />
            <h2 className="text-xl md:text-2xl font-bold text-zinc-100">
              No hay videos guardados
            </h2>
            <p className="text-center text-zinc-400">
              Los videos que guardes aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map(video => (
              <VideoCard 
                key={video.id} 
                video={video}
                showTimestamp
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
