import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from './useUser'
import { toast } from 'sonner'

export function useSubscription(channelId: string) {
  const { user } = useUser()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function checkSubscription() {
      if (!user) return
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .single()

      setIsSubscribed(!!data)
    }

    async function getSubscriberCount() {
      const { count } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('channel_id', channelId)

      setSubscriberCount(count || 0)
    }

    checkSubscription()
    getSubscriberCount()
  }, [user, channelId])

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte')
      return
    }

    try {
      setIsLoading(true)
      
      if (isSubscribed) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('channel_id', channelId)

        setIsSubscribed(false)
        setSubscriberCount(prev => prev - 1)
        toast.success('Suscripción cancelada')
      } else {
        await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            channel_id: channelId,
            created_at: new Date().toISOString()
          })

        setIsSubscribed(true)
        setSubscriberCount(prev => prev + 1)
        toast.success('¡Suscrito al canal!')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar la suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  return { isSubscribed, subscriberCount, isLoading, handleSubscribe }
}
