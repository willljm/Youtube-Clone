'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { addToWatchLater, removeFromWatchLater, isInWatchLater } from '@/lib/playlist'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

interface Props {
  videoId: string
}

export default function WatchLaterButton({ videoId }: Props) {
  const { user } = useUser()
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkStatus() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const status = await isInWatchLater(videoId, user.id)
        setIsSaved(status)
      } catch (error) {
        console.error('Error checking watch later status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [videoId, user])

  const handleToggleWatchLater = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar videos')
      return
    }

    try {
      setLoading(true)
      console.log('Toggling watch later for video:', videoId)

      if (isSaved) {
        const removed = await removeFromWatchLater(videoId, user.id)
        if (removed) {
          setIsSaved(false)
          toast.success('Video eliminado de Ver más tarde')
        } else {
          throw new Error('No se pudo eliminar el video')
        }
      } else {
        const added = await addToWatchLater(videoId, user.id)
        if (added) {
          setIsSaved(true)
          toast.success('Video guardado en Ver más tarde')
        } else {
          throw new Error('No se pudo guardar el video')
        }
      }
    } catch (error) {
      console.error('Error toggling watch later:', error)
      toast.error('Error al actualizar Ver más tarde')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className="flex items-center gap-2 p-2 rounded-lg opacity-50"
      >
        <Clock className="w-5 h-5" />
        <span>Cargando...</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleToggleWatchLater}
      disabled={loading}
      className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
        isSaved ? 'bg-zinc-800' : 'hover:bg-zinc-800'
      }`}
    >
      <Clock className={`w-5 h-5 ${isSaved ? 'text-blue-500' : 'text-zinc-400'}`} />
      <span className={isSaved ? 'text-blue-500' : 'text-zinc-400'}>
        {isSaved ? 'Guardado' : 'Ver más tarde'}
      </span>
    </button>
  )
}
