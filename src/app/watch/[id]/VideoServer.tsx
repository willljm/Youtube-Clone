import { supabase } from '@/lib/supabase'

export async function VideoServer({ id }: { id: string }) {
  // Obtener el video y la información del usuario
  const { data: video } = await supabase
    .from('videos')
    .select(`
      *,
      profile:user_id (
        id,
        email,
        avatar_url,
        full_name
      )
    `)
    .eq('id', id)
    .single()

  // Obtener el conteo de suscriptores
  const { count: subscriberCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('channel_id', video?.user_id)

  return { 
    video,
    channel: video?.profile,
    subscriberCount: subscriberCount || 0
  }
}
