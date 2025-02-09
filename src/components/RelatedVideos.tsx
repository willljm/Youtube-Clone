'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import VideoCard from './VideoCard'
import { Video } from '@/types'
import { useVideo } from '@/context/VideoContext'
import Link from 'next/link'
import Image from 'next/image'
import { formatTimeAgo, formatViewCount } from '@/lib/utils' // Cambiado de @/utils/formatters a @/lib/utils

interface RelatedVideosProps {
  currentVideoId: string
}

export default function RelatedVideos({ currentVideoId }: RelatedVideosProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { setCurrentVideo, setIsPlaying, setCurrentTime } = useVideo()

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        `)
        .neq('id', currentVideoId)
        .order('views', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching related videos:', error)
        setIsLoading(false)
        return
      }

      setVideos(data || [])
      setIsLoading(false)
    }

    fetchVideos()
  }, [currentVideoId])

  const handleVideoClick = (video: Video) => {
    setCurrentVideo(video)
    setIsPlaying(false)
    setCurrentTime(0)
  }

  if (isLoading) {
    return null
  }

  return (
    <div className="grid gap-2">
      {videos.map(video => (
        <Link 
          key={video.id} 
          href={`/watch/${video.id}`}
          className="flex gap-2 group cursor-pointer"
        >
          {/* Thumbnail */}
          <div className="relative w-40 h-[90px] flex-shrink-0">
            <Image
              src={video.thumbnail_url || '/thumbnail-placeholder.jpg'}
              alt={video.title}
              fill
              className="object-cover rounded-lg"
            />
            {/* You can add duration here if needed */}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-blue-500">
              {video.title}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              {video.profiles?.full_name}
            </p>
            <div className="flex items-center gap-1 text-xs text-zinc-400">
              <span>{formatViewCount(video.views)} visualizaciones</span>
              <span>•</span>
              <span>{formatTimeAgo(video.created_at)}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
