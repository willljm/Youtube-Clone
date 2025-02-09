import { supabase } from './supabase'

export interface LikedVideo {
  id: string
  title: string
  thumbnail_url: string
  views: number
  created_at: string
  liked_at: string
  user: {
    id: string
    username: string
    avatar_url: string
  }
}

export async function addToLikedVideos(videoId: string, userId: string) {
  try {
    // Primero obtener el video actual para verificar que existe y obtener el contador de likes
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('likes')
      .eq('id', videoId)
      .single()

    if (videoError) throw videoError

    const { error } = await supabase
      .from('video_likes')
      .insert({
        video_id: videoId,
        user_id: userId
      })

    if (error) throw error

    // Incrementar el contador de likes en la tabla de videos
    const { error: updateError } = await supabase
      .from('videos')
      .update({ likes: (video?.likes || 0) + 1 })
      .eq('id', videoId)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error('Error adding to liked videos:', error)
    return false
  }
}

export async function removeFromLikedVideos(videoId: string, userId: string) {
  try {
    // Primero obtener el video actual para verificar que existe y obtener el contador de likes
    const { data: video, error: videoError } = await supabase
      .from('videos')
      .select('likes')
      .eq('id', videoId)
      .single()

    if (videoError) throw videoError

    // Eliminar el like
    const { error } = await supabase
      .from('video_likes')
      .delete()
      .eq('video_id', videoId)
      .eq('user_id', userId)

    if (error) throw error

    // Decrementar el contador de likes en la tabla de videos
    const { error: updateError } = await supabase
      .from('videos')
      .update({ likes: Math.max(0, (video?.likes || 1) - 1) })
      .eq('id', videoId)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error('Error removing from liked videos:', error)
    return false
  }
}

export async function getLikedVideos(userId: string): Promise<LikedVideo[]> {
  try {
    console.log('Fetching liked videos for user:', userId);
    
    const { data, error } = await supabase
      .from('video_reactions')
      .select(`
        id,
        created_at,
        videos (
          id,
          title,
          thumbnail_url,
          views,
          created_at,
          profiles (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_like', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error in getLikedVideos query:', error);
      throw error;
    }

    console.log('Raw liked videos data:', data);

    if (!data) return [];

    const formattedVideos = data.map(item => {
      return {
        id: item.videos.id,
        title: item.videos.title,
        thumbnail_url: item.videos.thumbnail_url,
        views: item.videos.views,
        created_at: item.videos.created_at,
        liked_at: item.created_at,
        user: {
          id: item.videos.profiles.id,
          username: item.videos.profiles.full_name,
          avatar_url: item.videos.profiles.avatar_url || '/avatar-placeholder.png'
        }
      };
    });

    console.log('Formatted liked videos:', formattedVideos);
    return formattedVideos;

  } catch (error) {
    console.error('Error in getLikedVideos:', error);
    throw error;
  }
}

export async function isVideoLiked(videoId: string, userId: string) {
  try {
    if (!userId || !videoId) return false

    const { data, error } = await supabase
      .from('video_likes')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return !!data
  } catch (error) {
    console.error('Error checking liked status:', error)
    return false
  }
}
