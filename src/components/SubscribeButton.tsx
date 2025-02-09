'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'

export default function SubscribeButton({ channelId }: { channelId: string }) {
  const { user } = useUser()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para suscribirte')
      return
    }

    try {
      setIsLoading(true)
      
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('channel_id', channelId)
        .single()

      if (existingSub) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', user.id)
          .eq('channel_id', channelId)

        setIsSubscribed(false)
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
        toast.success('¡Suscrito al canal!')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al procesar la suscripción')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={`px-4 py-2 rounded-full font-medium transition-all
        ${isSubscribed 
          ? 'bg-zinc-700 hover:bg-zinc-600 text-white' 
          : 'bg-white text-black hover:bg-zinc-200'
        }
        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isLoading ? 'Cargando...' : isSubscribed ? 'Suscrito' : 'Suscribirse'}
    </button>
  )
}
