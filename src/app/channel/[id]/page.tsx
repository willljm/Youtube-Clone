import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase'
import { Metadata } from 'next'
import ChannelClient from './ChannelClient'

interface PageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  return {
    title: `${profile?.full_name || 'Canal'} - YouTube Clone`,
    description: profile?.description || ''
  }
}

export default async function ChannelPage({ params }: PageProps) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Obtener la sesión actual
  const { data: { session } } = await supabase.auth.getSession()

  // Obtener los datos del canal
  const { data: channel } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.id)
    .single()

  // Obtener los videos del canal
  const { data: videos } = await supabase
    .from('videos')
    .select(`
      *,
      profiles!inner (
        id,
        full_name,
        avatar_url,
        email
      )
    `)
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })

  // Obtener el conteo de suscriptores
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('channel_id')
    .eq('channel_id', params.id)

  const subscribersCount = subscriptions?.length || 0

  // Verificar si el usuario actual está suscrito
  let isSubscribed = false
  if (session?.user?.id) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id, notifications_enabled')
      .eq('user_id', session.user.id)
      .eq('channel_id', params.id)
      .maybeSingle()

    isSubscribed = !!subscription
  }

  const initialData = {
    channel: channel ? {
      ...channel,
      subscribers_count: subscribersCount
    } : null,
    videos: videos || [],
    subscribersCount,
    isSubscribed
  }

  return <ChannelClient initialData={initialData} />
}
