import { supabase } from './supabase'

export interface WatchLaterVideo {
  id: string
  title: string
  thumbnail_url: string
  views: number
  created_at: string
  added_at: string
  user: {
    id: string
    username: string
    avatar_url: string
  }
}

export async function getWatchLater(userId: string): Promise<WatchLaterVideo[]> {
  try {
    console.log('Fetching watch later for user:', userId);
    const { data, error } = await supabase
      .from('watch_later')
      .select(`
        *,
        videos!inner (
          id,
          title,
          thumbnail_url,
          views,
          created_at,
          user_id,
          profiles!inner (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching watch later:', error);
      throw error;
    }

    console.log('Raw watch later data:', data);

    return data?.map(item => ({
      id: item.videos.id,
      title: item.videos.title,
      thumbnail_url: item.videos.thumbnail_url,
      views: item.videos.views,
      created_at: item.videos.created_at,
      added_at: item.created_at, // Cambiado de item.added_at a item.created_at
      user: {
        id: item.videos.profiles.id,
        username: item.videos.profiles.full_name,
        avatar_url: item.videos.profiles.avatar_url || '/avatar-placeholder.png'
      }
    })) || [];
  } catch (error) {
    console.error('Error getting watch later videos:', error);
    throw error;
  }
}

export async function addToWatchLater(videoId: string, userId: string): Promise<boolean> {
  try {
    console.log('Adding to watch later:', { videoId, userId });

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('watch_later')
      .select('id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      console.log('Video already in watch later');
      return true;
    }

    // Insertar nuevo registro
    const { error } = await supabase
      .from('watch_later')
      .insert({
        video_id: videoId,
        user_id: userId
      });

    if (error) {
      console.error('Error in addToWatchLater:', error);
      throw error;
    }

    console.log('Successfully added to watch later');
    return true;
  } catch (error) {
    console.error('Failed to add to watch later:', error);
    return false;
  }
}

export async function removeFromWatchLater(videoId: string, userId: string): Promise<boolean> {
  try {
    console.log('Removing from watch later:', { videoId, userId });
    const { error } = await supabase
      .from('watch_later')
      .delete()
      .match({ 
        video_id: videoId,
        user_id: userId 
      });

    if (error) {
      console.error('Error removing from watch later:', error);
      throw error;
    }

    console.log('Successfully removed from watch later');
    return true;
  } catch (error) {
    console.error('Failed to remove from watch later:', error);
    return false;
  }
}

export async function isInWatchLater(videoId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('watch_later')
      .select('video_id')
      .eq('video_id', videoId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking watch later status:', error);
    return false;
  }
}
