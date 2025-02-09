'use client'

import { useEffect, useState } from 'react'
import { getHistory, WatchedVideo, clearHistory } from '@/lib/history'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'
import Image from 'next/image'
import { History, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatViewCount } from '@/lib/utils'
import { toast } from 'sonner'

export default function HistoryPage() {
  const { user } = useUser()
  const [videos, setVideos] = useState<WatchedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHistory() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const data = await getHistory(user.id)
        setVideos(data)
        setError(null)
      } catch (error) {
        console.error('Error loading history:', error)
        setError('Error al cargar el historial')
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user])

  const handleClearHistory = async () => {
    if (!user) return

    try {
      const success = await clearHistory(user.id)
      if (success) {
        setVideos([])
        toast.success('Historial borrado correctamente')
      } else {
        throw new Error('Error al borrar el historial')
      }
    } catch (error) {
      console.error('Error clearing history:', error)
      toast.error('Error al borrar el historial')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <History className="w-16 h-16 text-zinc-500" />
        <h1 className="text-2xl font-bold text-zinc-100">Inicia sesión para ver tu historial</h1>
        <p className="text-zinc-400 text-center">
          Los videos que veas aparecerán aquí
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <History className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-zinc-100">Error al cargar el historial</h1>
        <p className="text-zinc-400 text-center">{error}</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <History className="w-16 h-16 text-zinc-500" />
        <h1 className="text-2xl font-bold text-zinc-100">No hay videos en el historial</h1>
        <p className="text-zinc-400 text-center">
          Los videos que veas aparecerán aquí
        </p>
      </div>
    )
  }

  const latestVideo = videos[0]
  const remainingVideos = videos.slice(1)

  return (
    <div className="flex-1 overflow-hidden bg-[#0f0f0f]">
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
                <div className="relative w-full aspect-video rounded-xl overflow-hidden group">
                  <Image
                    src={latestVideo.thumbnail_url}
                    alt={latestVideo.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                </div>
              </Link>
            </div>
            <div className="flex-1 pt-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-zinc-800/50 backdrop-blur rounded-lg flex items-center justify-center">
                  <History className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white">Historial</h1>
                  <p className="text-zinc-400">{videos.length} videos</p>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:text-white transition-colors bg-zinc-800/50 backdrop-blur rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Borrar historial
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/watch/${latestVideo.id}`} className="group">
                  <h2 className="text-2xl font-medium text-white line-clamp-2 group-hover:text-zinc-300 transition-colors">
                    {latestVideo.title}
                  </h2>
                </Link>
                <Link
                  href={`/channel/${latestVideo.user.id}`}
                  className="text-zinc-300 hover:text-white transition-colors text-lg"
                >
                  {latestVideo.user.username}
                </Link>
                <div className="text-sm text-zinc-400 space-x-1">
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
                    Visto {formatDistanceToNow(new Date(latestVideo.watched_at), {
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

      {/* Lista de videos restantes */}
      <div className="max-w-[1850px] mx-auto px-8 py-8">
        <div className="space-y-3">
          {remainingVideos.map((video) => (
            <Link
              key={video.id}
              href={`/watch/${video.id}`}
              className="flex gap-4 hover:bg-zinc-800/50 p-3 rounded-xl transition-colors group"
            >
              <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-zinc-800">
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-zinc-100 line-clamp-2">{video.title}</h3>
                <Link
                  href={`/channel/${video.user.id}`}
                  className="text-sm text-zinc-400 hover:text-white mt-1 block"
                >
                  {video.user.username}
                </Link>
                <div className="text-sm text-zinc-500 space-x-1">
                  <span>{formatViewCount(video.views)} visualizaciones</span>
                  <span>•</span>
                  <span>
                    {formatDistanceToNow(new Date(video.created_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </span>
                </div>
                <div className="text-sm text-zinc-500 mt-1">
                  Visto {formatDistanceToNow(new Date(video.watched_at), {
                    addSuffix: true,
                    locale: es
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
