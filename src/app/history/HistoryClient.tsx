'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import VideoCard from '@/components/VideoCard'
import { formatTimeAgo } from '@/utils/format'
import { es } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { clearHistory } from '@/lib/history'

interface Video {
  id: string
  title: string
  description: string
  url: string
  thumbnail_url: string
  views: number
  likes: number
  dislikes: number
  created_at: string
  user: {
    id: string
    username: string
    avatar_url: string
  }
  history_created_at: string
}

export default function HistoryClient() {
  const { user } = useUser()
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true)
        setError(null)

        if (!user) {
          setError('Debes iniciar sesión para ver tu historial')
          return
        }

        const { data, error: historyError } = await supabase
          .from('video_history')
          .select(`
            video_id,
            created_at as history_created_at,
            videos (
              id,
              title,
              description,
              url,
              thumbnail_url,
              views,
              likes,
              dislikes,
              created_at,
              user:user_id (
                id,
                username,
                avatar_url
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (historyError) throw historyError

        const formattedVideos = data
          .filter(item => item.videos) 
          .map(item => ({
            ...item.videos,
            history_created_at: item.history_created_at
          }))

        setVideos(formattedVideos)
      } catch (error) {
        console.error('Error loading history:', error)
        setError('Error al cargar el historial')
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [user])

  const handleClearHistory = async () => {
    try {
      if (!user) return

      await clearHistory(user.id)
      setVideos([])
      toast.success('Historial borrado correctamente')
    } catch (error) {
      console.error('Error clearing history:', error)
      toast.error('Error al borrar el historial')
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-2">Inicia sesión para ver tu historial</h2>
        <p className="text-gray-500">Necesitas iniciar sesión para ver los videos que has visto</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] pt-16">
        <div className="max-w-[1350px] mx-auto px-4">
          <div className="animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800 h-48 mb-4 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-2">{error}</h2>
        <p className="text-gray-500">Lo sentimos, hubo un problema al cargar tu historial</p>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold mb-2">No hay videos en tu historial</h2>
        <p className="text-gray-500">Los videos que veas aparecerán aquí</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] pt-16">
      <div className="max-w-[1350px] mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Historial</h1>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Borrar historial
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {videos.map((video) => (
            <div key={`${video.id}-${video.history_created_at}`} className="flex flex-col">
              <VideoCard video={video} />
              <span className="text-sm text-gray-400 mt-1">
                Visto {formatTimeAgo(new Date(video.history_created_at), { locale: es })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
