'use client'

import { useState } from 'react'
import { MoreVertical, Clock, Share2, Download, Pencil, Trash2, Flag } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { addToWatchLater, removeFromWatchLater, isInWatchLater } from '@/lib/playlist'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Props {
  videoId: string
  isOwner?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export default function VideoCardMenu({ videoId, isOwner, onEdit, onDelete }: Props) {
  const { user } = useUser()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleWatchLater = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar videos')
      return
    }

    try {
      setIsLoading(true)
      const isInList = await isInWatchLater(videoId, user.id)
      
      if (isInList) {
        const success = await removeFromWatchLater(videoId, user.id)
        if (success) {
          toast.success('Eliminado de Ver más tarde')
        } else {
          throw new Error('No se pudo eliminar el video')
        }
      } else {
        const success = await addToWatchLater(videoId, user.id)
        if (success) {
          toast.success('Guardado en Ver más tarde')
        } else {
          throw new Error('No se pudo guardar el video')
        }
      }
      
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Error toggling watch later:', error)
      toast.error('Error al actualizar Ver más tarde')
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/watch/${videoId}`)
      toast.success('Enlace copiado al portapapeles')
      setIsOpen(false)
    } catch (error) {
      console.error('Error sharing video:', error)
      toast.error('Error al compartir el video')
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 transition-colors rounded-full hover:bg-zinc-800"
      >
        <MoreVertical className="w-5 h-5 text-zinc-400" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 z-20 w-56 mt-2 border shadow-lg top-full rounded-xl border-zinc-800 bg-zinc-900">
            <div className="py-1">
              <button
                onClick={handleToggleWatchLater}
                disabled={isLoading}
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <Clock className="w-4 h-4" />
                <span>Ver más tarde</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </button>

              <button
                onClick={() => window.location.href = `/download/${videoId}`}
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </button>

              <button
                onClick={() => toast.success('Gracias por reportar el video')}
                className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <Flag className="w-5 h-5" />
                <span>Reportar</span>
              </button>

              {isOwner && (
                <>
                  <hr className="my-1 border-zinc-800" />
                  
                  <button
                    onClick={() => {
                      onEdit?.()
                      setIsOpen(false)
                    }}
                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left transition-colors text-zinc-400 hover:bg-zinc-800 hover:text-white"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => {
                      onDelete?.()
                      setIsOpen(false)
                    }}
                    className="flex items-center w-full gap-2 px-4 py-2 text-sm text-left text-red-500 transition-colors hover:bg-zinc-800 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
