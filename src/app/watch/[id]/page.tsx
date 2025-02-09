import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import WatchClient from './WatchClient'

interface Props {
  params: {
    id: string
  }
}

export default async function WatchPage({ params }: Props) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  const videoId = await Promise.resolve(params.id)

  const { data: { session } } = await supabase.auth.getSession()

  // Get video data
  const { data: video, error: videoError } = await supabase
    .from('videos')
    .select(`
      *,
      profile:profiles(
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('id', videoId)
    .single()

  if (videoError || !video) {
    console.error('Error fetching video:', videoError)
    redirect('/')
  }

  // Get user's reaction to this video if logged in
  let userReaction = null
  if (session?.user) {
    const { data: reaction } = await supabase
      .from('video_reactions')
      .select('type')
      .eq('video_id', videoId)
      .eq('user_id', session.user.id)
      .single()

    userReaction = reaction?.type || null
  }

  // Prepare video data for client
  const videoData = {
    video: {
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnail_url: video.thumbnail_url,
      views: video.views,
      likes: video.likes,
      created_at: video.created_at,
      user_id: video.user_id // Añadido user_id
    },
    channel: {
      id: video.profile.id,
      full_name: video.profile.full_name,
      avatar_url: video.profile.avatar_url
    },
    userReaction
  }

  // Increment views
  try {
    const { error: updateError } = await supabase
      .from('videos')
      .update({ views: (video.views || 0) + 1 })
      .eq('id', videoId)

    if (updateError) {
      console.error('Error updating views:', updateError)
    }
  } catch (error) {
    console.error('Error incrementing views:', error)
  }

  return (
    <div className="w-full">
      <WatchClient videoData={videoData} key={videoId} />
    </div>
  )
}
