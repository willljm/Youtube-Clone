'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { ThumbsUp, ThumbsDown, Share2, MoreVertical, Download, Flag, Clock, Edit } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { formatTimeAgo, formatViewCount } from '@/lib/utils'
import VideoPlayer from '@/components/VideoPlayer'
import RelatedVideos from '@/components/RelatedVideos'
import Comments from '@/components/Comments'
import { addToWatchLater } from '@/lib/playlist' // Añadir esta importación
import SubscribeButton from '@/components/SubscribeButton'

interface VideoData {
  video: {
    id: string
    title: string
    description: string
    url: string
    thumbnail_url: string
    views: number
    likes: number
    created_at: string
    user_id: string
  }
  channel: {
    id: string
    full_name: string
    avatar_url: string
  }
  userReaction: string | null
}

interface WatchClientProps {
  videoData: VideoData
}

export default function WatchClient({ videoData }: WatchClientProps) {
  const { user } = useUser()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [reaction, setReaction] = useState<string | null>(videoData.userReaction)
  const [likeCount, setLikeCount] = useState(videoData.video.likes)
  const [isLoading, setIsLoading] = useState(true)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const checkSubscriptionStatus = useCallback(async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select()
        .eq('user_id', user.id)
        .eq('channel_id', videoData.channel.id)
        .single()

      if (error) throw error
      setIsSubscribed(!!data)
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }, [user, videoData.channel.id])

  const getSubscriberCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', videoData.channel.id)

      if (error) throw error
      setSubscriberCount(count || 0)
    } catch (error) {
      console.error('Error getting subscriber count:', error)
    }
  }, [videoData.channel.id])

  const checkUserReaction = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('video_reactions')
        .select('is_like')
        .eq('video_id', videoData.video.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error al verificar reacción:', error);
        return;
      }

      setReaction(data?.is_like === true ? 'like' : data?.is_like === false ? 'dislike' : null);
    } catch (error) {
      console.error('Error al verificar reacción:', error);
    }
  }, [user, videoData.video.id])

  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        checkSubscriptionStatus(),
        checkUserReaction(),
        getSubscriberCount()
      ])
    }
    loadInitialData()
  }, [checkSubscriptionStatus, checkUserReaction, getSubscriberCount])

  const isVideoOwner = user?.id === videoData.video.user_id

  const handleEditVideo = () => {
    window.location.href = `/studio/video/${videoData.video.id}`
  }

  const handleSaveToWatchLater = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar videos')
      return
    }

    try {
      setShowMoreOptions(false) // Cerrar el menú después de hacer clic
      const success = await addToWatchLater(videoData.video.id, user.id)
      if (success) {
        toast.success('Video guardado en Ver más tarde')
      } else {
        throw new Error('No se pudo guardar el video')
      }
    } catch (error) {
      console.error('Error al guardar el video:', error)
      toast.error('No se pudo guardar el video')
    }
  }

  const handleDownload = () => {
    window.open(videoData.video.url, '_blank')
  }

  const handleReport = () => {
    toast.success('Gracias por reportar el video. Lo revisaremos pronto.')
  }

  const handleReaction = async (type: 'like' | 'dislike') => {
    if (!user) {
      toast.error('Debes iniciar sesión para reaccionar');
      return;
    }

    try {
      const isLike = type === 'like';
      
      if (reaction === type) {
        // Eliminar reacción
        await supabase.from('video_reactions').delete()
          .eq('user_id', user.id)
          .eq('video_id', videoData.video.id);

        // Actualizar el contador de likes en la tabla de videos
        await supabase.from('videos')
          .update({ likes: likeCount - 1 })
          .eq('id', videoData.video.id);

        setReaction(null);
        setLikeCount(prev => prev - 1);
      } else {
        // Agregar/actualizar reacción
        await supabase.from('video_reactions').upsert({
          video_id: videoData.video.id,
          user_id: user.id,
          is_like: isLike,
          created_at: new Date().toISOString()
        });

        // Actualizar el contador de likes en la tabla de videos
        const newLikeCount = reaction === 'like' ? likeCount - 1 : likeCount + 1;
        await supabase.from('videos')
          .update({ likes: newLikeCount })
          .eq('id', videoData.video.id);

        setReaction(type);
        setLikeCount(newLikeCount);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al procesar tu reacción');
    }
  };

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte')
      return
    }

    try {
      setIsLoading(true)
      
      // Verificar si ya existe la suscripción
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_id', videoData.channel.id)
        .single()

      if (existingSub) {
        // Si existe, eliminar la suscripción
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('channel_id', videoData.channel.id)

        if (error) throw error
        setIsSubscribed(false)
        toast.success('Suscripción cancelada')
      } else {
        // Si no existe, crear nueva suscripción
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            channel_id: videoData.channel.id,
            created_at: new Date().toISOString()
          })

        if (error) throw error
        setIsSubscribed(true)
        toast.success('¡Suscrito al canal!')
      }

      await getSubscriberCount() 
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar la suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col lg:flex-row max-w-[1300px] mx-auto mb-8 mt-4">
      <div className="flex-1 lg:max-w-[70%]">
        <div className="relative pt-[56.25%] w-full">
          <div className="absolute inset-0">
            <VideoPlayer url={videoData.video.url} autoPlay={true} />
          </div>
        </div>

        <div className="p-3">
          <h1 className="mb-3 text-xl font-semibold">{videoData.video.title}</h1>
          
          {/* Channel info and actions - Nueva estructura */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href={`/channel/${videoData.channel.id}`}>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src={videoData.channel.avatar_url || '/default-avatar.png'}
                      alt={videoData.channel.full_name}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{videoData.channel.full_name}</p>
                    <p className="text-sm text-zinc-400">{subscriberCount} suscriptores</p>
                  </div>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {!isVideoOwner && (
                  <SubscribeButton channelId={videoData.channel.id} />
                )}

                {/* Action buttons */}
                <div className="flex items-center bg-[#272727] rounded-full">
                  <button
                    onClick={() => handleReaction('like')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-l-full hover:bg-[#3f3f3f] ${
                      reaction === 'like' ? 'text-blue-500' : ''
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span className="text-sm">{formatViewCount(likeCount)}</span>
                  </button>
                  <div className="h-5 w-[1px] bg-zinc-700"></div>
                  <button
                    onClick={() => handleReaction('dislike')}
                    className={`px-3 py-2 rounded-r-full hover:bg-[#3f3f3f] ${
                      reaction === 'dislike' ? 'text-blue-500' : ''
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast.success('Enlace copiado al portapapeles')
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-[#272727] rounded-full hover:bg-[#3f3f3f]"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="hidden text-sm sm:inline">Compartir</span>
                </button>

                {/* More options menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowMoreOptions(!showMoreOptions)}
                    className="p-2 hover:bg-[#272727] rounded-full"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showMoreOptions && (
                    <div className="absolute right-0 mt-2 py-2 w-48 bg-[#272727] rounded-xl shadow-lg z-50">
                      <button
                        onClick={handleSaveToWatchLater}
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-[#3f3f3f]"
                      >
                        <Clock className="w-5 h-5" />
                        <span>Ver más tarde</span>
                      </button>
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-[#3f3f3f]"
                      >
                        <Download className="w-5 h-5" />
                        <span>Descargar</span>
                      </button>
                      <button
                        onClick={handleReport}
                        className="flex items-center gap-3 w-full px-4 py-2 hover:bg-[#3f3f3f]"
                      >
                        <Flag className="w-5 h-5" />
                        <span>Reportar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#272727] rounded-xl">
            <div className="flex gap-2 mb-2 text-sm text-zinc-400">
              <span>{formatViewCount(videoData.video.views)} visualizaciones</span>
              <span>•</span>
              <span>hace {formatTimeAgo(videoData.video.created_at)}</span>
            </div>
            <div className={`${showFullDescription ? '' : 'line-clamp-2'} whitespace-pre-wrap`}>
              {videoData.video.description}
            </div>
            {videoData.video.description.length > 100 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-2 text-sm font-medium text-blue-500 hover:text-blue-400"
              >
                {showFullDescription ? 'Mostrar menos' : 'Mostrar más'}
              </button>
            )}
          </div>

          <div className="mt-6">
            <Comments videoId={videoData.video.id} />
          </div>
        </div>
      </div>

      <div className="lg:w-[30%] p-3 lg:pt-0">
        <RelatedVideos currentVideoId={videoData.video.id} />
      </div>
    </div>
  )
}