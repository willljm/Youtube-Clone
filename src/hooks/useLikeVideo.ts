import { useState, useEffect } from 'react'
import { useUser } from './useUser'
import { supabase } from '@/lib/supabase'

export function useLikeVideo(videoId: string) {
  const { user } = useUser()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function checkLikeStatus() {
      if (!user || !videoId) {
        setIsLoading(false)
        return
      }

      try {
        // Obtener el estado del like y el conteo en una sola consulta
        const [{ data: likes }, { count }] = await Promise.all([
          supabase
            .from('video_likes')
            .select('id')
            .eq('video_id', videoId)
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('video_likes')
            .select('id', { count: 'exact', head: true })
            .eq('video_id', videoId)
        ])

        if (isMounted) {
          setIsLiked(!!likes)
          setLikeCount(count || 0)
        }
      } catch (error) {
        console.error('Error checking like status:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkLikeStatus()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [videoId, user])

  const toggleLike = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (!user || !videoId || isLoading) return

    setIsLoading(true)
    try {
      if (isLiked) {
        // Remove like
        await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', user.id)
        
        setIsLiked(false)
        setLikeCount((prev) => prev - 1)
      } else {
        // Add like
        await supabase
          .from('video_likes')
          .insert({ video_id: videoId, user_id: user.id })
        
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLiked,
    likeCount,
    isLoading,
    toggleLike
  }
}
