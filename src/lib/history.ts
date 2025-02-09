import { supabase } from './supabase'

export interface WatchedVideo {
  id: string
  title: string
  description: string
  thumbnail_url: string
  url: string
  views: number
  created_at: string
  watched_at: string
  user: {
    id: string
    username: string
    avatar_url: string
  }
}

export async function addToHistory(videoId: string, userId: string) {
  if (!videoId || !userId) {
    throw new Error('addToHistory: Missing required parameters')
  }

  try {
    // Primero verificamos si ya existe en el historial
    const { data: existingEntry, error: existingError } = await supabase
      .from('video_history')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .single()

    if (existingError && !existingError.message.includes('No rows found')) {
      throw existingError
    }

    // Si ya existe, actualizamos la fecha
    if (existingEntry?.id) {
      const { error: updateError } = await supabase
        .from('video_history')
        .update({ watched_at: new Date().toISOString() })
        .eq('id', existingEntry.id)

      if (updateError) throw updateError
      return
    }

    // Si no existe, creamos una nueva entrada
    const { error: insertError } = await supabase
      .from('video_history')
      .insert([
        {
          video_id: videoId,
          user_id: userId,
          watched_at: new Date().toISOString()
        }
      ])

    if (insertError) {
      // Si el error es de duplicado (23505), lo ignoramos
      if (!insertError.message?.includes('23505')) {
        throw insertError
      }
    }
  } catch (error) {
    console.error('Error in addToHistory:', error)
    throw error
  }
}

export async function removeFromHistory(videoId: string, userId: string) {
  if (!videoId || !userId) return

  try {
    const { error } = await supabase
      .from('video_history')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error removing from history:', error)
    throw error
  }
}

export async function clearHistory(userId: string) {
  if (!userId) return

  try {
    const { error } = await supabase
      .from('video_history')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Error clearing history:', error)
    throw error
  }
}

export async function getHistory(userId: string): Promise<WatchedVideo[]> {
  if (!userId) return []

  try {
    const { data, error } = await supabase
      .from('video_history')
      .select(`
        video_id,
        created_at,
        videos (
          id,
          title,
          description,
          url,
          thumbnail_url,
          views,
          likes,
          dislikes,
          created_at,
          user:user_id (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(item => ({
      id: item.videos.id,
      title: item.videos.title,
      description: item.videos.description,
      thumbnail_url: item.videos.thumbnail_url,
      url: item.videos.url,
      views: item.videos.views,
      created_at: item.videos.created_at,
      watched_at: item.created_at,
      user: {
        id: item.videos.user.id,
        username: item.videos.user.username,
        avatar_url: item.videos.user.avatar_url
      }
    })) as WatchedVideo[]
  } catch (error) {
    console.error('Error getting history:', error)
    throw error
  }
}
