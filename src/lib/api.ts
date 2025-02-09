import { supabase } from './supabase'
import { Video, Comment, Channel } from '../types'

export async function getVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        email
      ),
      channel:channels(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getVideo(id: string) {
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      profiles:user_id (
        id,
        full_name,
        avatar_url,
        email
      ),
      channel:channels(*),
      comments:comments(
        *,
        user:users(*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createVideo(video: Partial<Video>) {
  const { data, error } = await supabase
    .from('videos')
    .insert(video)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getComments(videoId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(*)
    `)
    .eq('video_id', videoId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createComment(comment: Partial<Comment>) {
  const { data, error } = await supabase
    .from('comments')
    .insert(comment)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getChannel(id: string) {
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function updateChannel(id: string, channel: Partial<Channel>) {
  const { data, error } = await supabase
    .from('channels')
    .update(channel)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleVideoLike(videoId: string, userId: string, isLike: boolean) {
  const { data, error } = await supabase
    .from('video_reactions')
    .upsert({
      video_id: videoId,
      user_id: userId,
      is_like: isLike
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function toggleSubscription(channelId: string, userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .upsert({
      channel_id: channelId,
      user_id: userId
    })
    .select()
    .single()

  if (error) throw error
  return data
}
