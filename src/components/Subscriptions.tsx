'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'

interface Subscription {
  channel: {
    id: string
    full_name: string
    avatar_url: string
  }
  has_new_videos: boolean
}

export default function Subscriptions() {
  const { user } = useUser()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    if (user) {
      loadSubscriptions()
    }
  }, [user])

  const loadSubscriptions = async () => {
    // Primero obtenemos las suscripciones
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('channel_id')
      .eq('user_id', user?.id)

    if (subs && subs.length > 0) {
      // Luego obtenemos los detalles de los canales
      const { data: channels } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', subs.map(sub => sub.channel_id))

      if (channels) {
        // Verificar videos nuevos (últimas 24 horas)
        const subscriptionsWithNewVideos = await Promise.all(
          channels.map(async (channel) => {
            const oneDayAgo = new Date()
            oneDayAgo.setDate(oneDayAgo.getDate() - 1)

            const { count } = await supabase
              .from('videos')
              .select('id', { count: true })
              .eq('user_id', channel.id)
              .gte('created_at', oneDayAgo.toISOString())

            return {
              channel,
              has_new_videos: count ? count > 0 : false
            }
          })
        )

        setSubscriptions(subscriptionsWithNewVideos)
      }
    }
  }

  if (!user || subscriptions.length === 0) return null

  return (
    <div className="px-2 py-4 border-t border-zinc-700">
      <h3 className="px-4 mb-2 text-sm font-medium text-white">Suscripciones</h3>
      {subscriptions.map((sub) => (
        <Link
          key={sub.channel.id}
          href={`/channel/${sub.channel.id}`}
          className="flex items-center gap-4 px-4 py-2 rounded-lg text-white hover:bg-zinc-700"
        >
          <div className="relative">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-700">
              {sub.channel.avatar_url && (
                <Image
                  src={sub.channel.avatar_url}
                  alt={sub.channel.full_name}
                  width={24}
                  height={24}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {sub.has_new_videos && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </div>
          <span className="text-sm">{sub.channel.full_name}</span>
        </Link>
      ))}
    </div>
  )
}
