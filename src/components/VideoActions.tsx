'use client'

import { ThumbsUp, ThumbsDown, Share2, MoreVertical, Download, Flag, Clock } from 'lucide-react'
import { useLikeVideo } from '@/hooks/useLikeVideo'
import { useUser } from '@/hooks/useUser'
import { formatNumber } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface VideoActionsProps {
  videoId: string
}

export default function VideoActions({ videoId }: VideoActionsProps) {
  const { user } = useUser()
  const { isLiked, likeCount, toggleLike, isLoading } = useLikeVideo(videoId)

  const handleLikeClick = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para dar like')
      return
    }
    await toggleLike()
  }

  const handleWatchLater = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar el video')
      return
    }

    try {
      const { error } = await supabase
        .from('watch_later')
        .upsert({ user_id: user.id, video_id: videoId })

      if (error) throw error

      toast.success('Video guardado en Ver más tarde')
    } catch (error) {
      console.error('Error al guardar en ver más tarde:', error)
      toast.error('No se pudo guardar el video')
    }
  }

  const handleDownload = () => {
    // Aquí puedes implementar la lógica de descarga
    toast.success('Descargando video...')
  }

  const handleReport = () => {
    if (!user) {
      toast.error('Debes iniciar sesión para denunciar')
      return
    }
    toast.success('Gracias por reportar este video')
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-full bg-zinc-800">
        <button
          onClick={handleLikeClick}
          disabled={isLoading}
          className={`flex items-center gap-1 px-4 py-2 rounded-l-full hover:bg-zinc-700 transition-colors ${
            isLiked ? 'text-blue-500' : 'text-zinc-100'
          }`}
        >
          <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span>{formatNumber(likeCount)}</span>
        </button>
        <div className="w-[1px] h-6 bg-zinc-700" />
        <button className="flex items-center gap-1 px-4 py-2 rounded-r-full hover:bg-zinc-700 transition-colors text-zinc-100">
          <ThumbsDown className="w-5 h-5" />
        </button>
      </div>

      <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-100">
        <Share2 className="w-5 h-5" />
        <span>Compartir</span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-100">
            <MoreVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            <span>Descargar</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleWatchLater} className="gap-2">
            <Clock className="w-4 h-4" />
            <span>Guardar en Ver más tarde</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleReport} className="gap-2 text-red-500 focus:text-red-500">
            <Flag className="w-4 h-4" />
            <span>Denunciar</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
