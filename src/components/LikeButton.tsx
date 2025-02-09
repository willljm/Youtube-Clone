'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface Props {
  videoId: string
  initialLikes?: number
  initialDislikes?: number
  initialReaction?: 'like' | 'dislike' | null
}

export default function LikeButton({ 
  videoId, 
  initialLikes = 0, 
  initialDislikes = 0,
  initialReaction = null 
}: Props) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userReaction, setUserReaction] = useState<'like' | 'dislike' | null>(initialReaction)
  const [loading, setLoading] = useState(false)

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (loading) return

    try {
      setLoading(true)
      const previousReaction = userReaction
      const previousLikes = likes
      const previousDislikes = dislikes

      // Actualizar UI inmediatamente
      if (userReaction === type) {
        setUserReaction(null)
        if (type === 'like') {
          setLikes(prev => prev - 1)
        } else {
          setDislikes(prev => prev - 1)
        }
      } else {
        if (userReaction === 'like') {
          setLikes(prev => prev - 1)
          if (type === 'dislike') setDislikes(prev => prev + 1)
        } else if (userReaction === 'dislike') {
          setDislikes(prev => prev - 1)
          if (type === 'like') setLikes(prev => prev + 1)
        } else {
          if (type === 'like') setLikes(prev => prev + 1)
          if (type === 'dislike') setDislikes(prev => prev + 1)
        }
        setUserReaction(type)
      }

      // Realizar la actualización en la base de datos
      if (userReaction === type) {
        const { error } = await supabase
          .from('video_reactions')
          .delete()
          .match({ video_id: videoId })

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('video_reactions')
          .upsert([{ 
            video_id: videoId, 
            type,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      // Actualizar el contador en la base de datos
      const { error: updateError } = await supabase
        .from('videos')
        .update({ 
          likes: type === 'like' ? likes : previousLikes,
          dislikes: type === 'dislike' ? dislikes : previousDislikes
        })
        .eq('id', videoId)

      if (updateError) throw updateError

    } catch (error) {
      console.error('Error al reaccionar:', error)
      // Revertir cambios en caso de error
      setUserReaction(previousReaction)
      setLikes(previousLikes)
      setDislikes(previousDislikes)
      toast.error('Error al procesar tu reacción')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex overflow-hidden rounded-full bg-zinc-800">
      <button
        onClick={() => !loading && handleReaction('like')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 hover:bg-zinc-700 transition-colors ${
          userReaction === 'like' ? 'text-blue-400' : 'text-white'
        }`}
      >
        <ThumbsUp className="w-5 h-5" />
        <span>{likes}</span>
      </button>
      <button
        onClick={() => !loading && handleReaction('dislike')}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 border-l border-zinc-700 hover:bg-zinc-700 transition-colors ${
          userReaction === 'dislike' ? 'text-blue-400' : 'text-white'
        }`}
      >
        <ThumbsDown className="w-5 h-5" />
        <span>{dislikes}</span>
      </button>
    </div>
  )
}
