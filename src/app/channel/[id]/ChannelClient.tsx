'use client'

import { Video, Profile } from '@/types'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import VideoCard from '@/components/VideoCard'
import { toast } from 'sonner'
import { Bell, BellRing } from 'lucide-react'

interface ChannelClientProps {
  initialData: {
    channel: Profile
    videos: Video[]
    subscribersCount: number
    isSubscribed: boolean
  }
}

export default function ChannelClient({ initialData }: ChannelClientProps) {
  const { user } = useUser()
  const [isSubscribed, setIsSubscribed] = useState(initialData.isSubscribed)
  const [hasNotifications, setHasNotifications] = useState(false)
  const [subscribersCount, setSubscribersCount] = useState(initialData.subscribersCount)
  const [isLoading, setIsLoading] = useState(false)
  const isOwnChannel = user?.id === initialData.channel.id

  // Cargar el estado de notificaciones
  useEffect(() => {
    const loadNotificationsState = async () => {
      if (!user || !isSubscribed) {
        setHasNotifications(false)
        return
      }

      try {
        const { data } = await supabase
          .from('subscriptions')
          .select('notifications_enabled')
          .eq('user_id', user.id)
          .eq('channel_id', initialData.channel.id)
          .maybeSingle()

        setHasNotifications(data?.notifications_enabled || false)
      } catch (error) {
        console.error('Error loading notifications state:', error)
      }
    }

    loadNotificationsState()
  }, [user, initialData.channel.id, isSubscribed])

  // Suscribirse a cambios en tiempo real de las suscripciones
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `channel_id=eq.${initialData.channel.id}`
        },
        async () => {
          // Recargar el conteo de suscriptores
          await loadSubscribersCount()
          
          // Verificar el estado de suscripción del usuario actual
          if (user) {
            const { data } = await supabase
              .from('subscriptions')
              .select('id, notifications_enabled')
              .eq('user_id', user.id)
              .eq('channel_id', initialData.channel.id)
              .maybeSingle()

            setIsSubscribed(!!data)
            setHasNotifications(data?.notifications_enabled || false)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user, initialData.channel.id])

  const loadSubscribersCount = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('subscriptions')
        .select('channel_id')
        .eq('channel_id', initialData.channel.id)

      if (data) {
        setSubscribersCount(data.length)
      }
    } catch (error) {
      console.error('Error loading subscribers:', error)
    }
  }, [initialData.channel.id])

  useEffect(() => {
    loadSubscribersCount();
  }, [loadSubscribersCount]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte')
      return
    }

    try {
      setIsLoading(true)
      
      const { data: existingSub, error: checkError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_id', initialData.channel.id)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingSub) {
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('channel_id', initialData.channel.id)

        if (error) throw error
        setIsSubscribed(false)
        toast.success('Suscripción cancelada')
      } else {
        const { error } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            channel_id: initialData.channel.id,
            created_at: new Date().toISOString()
          })

        if (error) throw error
        setIsSubscribed(true)
        toast.success('¡Suscrito al canal!')
      }

      await loadSubscribersCount()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar la suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNotifications = async () => {
    if (!user || !isSubscribed || isLoading) return

    try {
      setIsLoading(true)
      const newNotificationState = !hasNotifications
      const { error } = await supabase
        .from('subscriptions')
        .update({ notifications_enabled: newNotificationState })
        .eq('user_id', user.id)
        .eq('channel_id', initialData.channel.id)

      if (error) throw error

      setHasNotifications(newNotificationState)
      toast.success(newNotificationState ? 'Notificaciones activadas' : 'Notificaciones desactivadas')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar las notificaciones')
      
      // Recargar el estado actual
      const { data } = await supabase
        .from('subscriptions')
        .select('id, notifications_enabled')
        .eq('user_id', user.id)
        .eq('channel_id', initialData.channel.id)
        .maybeSingle()

      setIsSubscribed(!!data)
      setHasNotifications(data?.notifications_enabled || false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex-1 min-h-screen bg-[#0f0f0f] pl-0 md:pl-60">
      {/* Banner */}
      <div className="relative w-full h-32 md:h-48 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Profile Section */}
      <div className="px-4 mx-auto max-w-7xl">
        <div className="relative pb-4 -mt-16 border-b border-zinc-800">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6">
            {/* Avatar */}
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#0f0f0f] bg-zinc-800">
              {initialData.channel.avatar_url && (
                <Image
                  src={initialData.channel.avatar_url}
                  alt={initialData.channel.full_name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1 text-center md:text-left md:pt-16">
              <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white md:text-2xl">
                    {initialData.channel.full_name}
                  </h1>
                  <p className="text-zinc-400">
                    {subscribersCount} suscriptores
                  </p>
                </div>

                {/* Subscribe Button */}
                {!isOwnChannel && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSubscribe}
                      disabled={isLoading}
                      className={`
                        px-4 py-2 rounded-full font-medium transition-all
                        ${isSubscribed 
                          ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
                          : 'bg-white text-black hover:bg-zinc-200'
                        }
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {isLoading ? 'Cargando...' : isSubscribed ? 'Suscrito' : 'Suscribirse'}
                    </button>
                    
                    {isSubscribed && (
                      <button
                        onClick={toggleNotifications}
                        disabled={isLoading}
                        className={`
                          p-2 rounded-full transition-all
                          ${hasNotifications ? 'bg-zinc-700' : 'bg-zinc-800'}
                          hover:bg-zinc-600
                          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                      >
                        {hasNotifications ? (
                          <BellRing className="w-5 h-5 text-white" />
                        ) : (
                          <Bell className="w-5 h-5 text-white" />
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="py-6 md:py-8">
          <h2 className="mb-4 text-lg font-bold text-white md:mb-6 md:text-xl">Videos</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {initialData.videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          {initialData.videos.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-zinc-400">Este canal no tiene videos publicados</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
