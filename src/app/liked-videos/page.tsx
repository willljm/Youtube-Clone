'use client'

import { useEffect, useState } from 'react'
import { getLikedVideos, LikedVideo } from '@/lib/likes'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'
import Image from 'next/image'
import { ThumbsUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatViewCount } from '@/lib/utils'
import VideoCard from '@/components/VideoCard'

export default function LikedVideosPage() {
  const { user } = useUser()
  const [videos, setVideos] = useState<LikedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLikedVideos() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        console.log('Loading liked videos for user:', user.id);
        const { data, status } = await getLikedVideos(user.id)
        console.log('Liked videos loaded:', data);
        setVideos(data)
        setError(null)
      } catch (error) {
        console.error('Error in loadLikedVideos:', error)
        setError('Error al cargar los videos que te gustan')
      } finally {
        setLoading(false)
      }
    }

    loadLikedVideos()
  }, [user])

  if (loading) {
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
          Los videos que te gusten aparecerán aquí
        </p>
      </div>
    )
  }

  
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <ThumbsUp className="w-16 h-16 text-zinc-500" />
        <h1 className="text-2xl font-bold text-zinc-100">No hay videos que te gusten</h1>
        <p className="text-center text-zinc-400">
          Los videos que te gusten aparecerán aquí
        </p>
      </div>
    )
  }

  const latestVideo = videos[0]
  const remainingVideos = videos.slice(1)

  return (
    <div className={`min-h-screen bg-[#0f0f0f] transition-all duration-300 overflow-hidden ${
      isExpanded ? 'md:pl-60' : 'md:pl-20'
    }`}>
      {/* Banner del último video */}
      <div className="relative h-[400px] w-full">
        <div className="absolute inset-0">
          <Image
            src={latestVideo.thumbnail_url}
            alt={latestVideo.title}
            fill
            className="object-cover"
            priority
          />
          {/* Degradado oscuro */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/60 to-transparent" />
        </div>
        
        <div className="relative h-full max-w-[1850px] mx-auto px-8 flex flex-col justify-end pb-12">
          <div className="flex items-start gap-6">
            <div className="w-[300px] flex-shrink-0">
              <Link href={`/watch/${latestVideo.id}`} className="block">
                <div className="relative w-full overflow-hidden aspect-video rounded-xl group">
                  <Image
                    src={latestVideo.thumbnail_url}
                    alt={latestVideo.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 transition-colors bg-black/20 group-hover:bg-black/0" />
                </div>
              </Link>
            </div>
            <div className="flex-1 pt-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-zinc-800/50 backdrop-blur">
                  <ThumbsUp className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Videos que me gustan</h1>
                  <p className="text-zinc-400">{videos.length} videos</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/watch/${latestVideo.id}`} className="group">
                  <h2 className="text-2xl font-medium text-white transition-colors line-clamp-2 group-hover:text-zinc-300">
                    {latestVideo.title}
                  </h2>
                </Link>
                <Link
                  href={`/channel/${latestVideo.user.id}`}
                  className="text-lg transition-colors text-zinc-300 hover:text-white"
                >
                  {latestVideo.user.username}
                </Link>
                <div className="space-x-1 text-sm text-zinc-400">
                  <span>{formatViewCount(latestVideo.views)} visualizaciones</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(latestVideo.created_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </span>
                  <span>•</span>
                  <span>
                    Te gustó {formatDistanceToNow(new Date(latestVideo.liked_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de videos */}
      <div className="max-w-[1850px] mx-auto px-8 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {remainingVideos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  )
}
