'use client'

import { formatTimeAgo, formatViewCount } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Video } from '@/types'
import VideoCardMenu from './VideoCardMenu'

interface VideoCardProps {
  video: Video
  hideChannel?: boolean
  horizontal?: boolean
}

export default function VideoCard({ video, hideChannel = false, horizontal = false }: VideoCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <Link href={`/watch/${video.id}`}>
        <div className={`flex ${horizontal ? 'flex-col md:flex-row md:gap-4' : 'flex-col'} gap-2`}>
          {/* Thumbnail */}
          <div className={`relative ${horizontal ? 'w-full md:w-60 md:shrink-0' : 'w-full'} aspect-video rounded-xl overflow-hidden bg-zinc-800`}>
            <Image
              src={video.thumbnail_url || '/thumbnail-placeholder.png'}
              alt={video.title}
              fill
              className="object-cover"
              sizes={horizontal ? '(max-width: 768px) 100vw, 240px' : '100%'}
            />
            {video.duration && (
              <div className="absolute px-1 text-xs text-white rounded right-1 bottom-1 bg-black/80">
                {video.duration}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex gap-3">
            {!hideChannel && video.profiles && (
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src={video.profiles.avatar_url || '/avatar-placeholder.png'}
                  alt={video.profiles.full_name || 'Usuario'}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium line-clamp-2">
                {video.title}
              </h3>
              {!hideChannel && video.profiles && (
                <div className="mt-1 text-sm text-zinc-400">
                  {video.profiles.full_name}
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-zinc-400">
                <span>{formatViewCount(video.views)} visualizaciones</span>
                <span>•</span>
                <span>hace {formatTimeAgo(video.created_at)}</span>
              </div>
              {video.liked_at && (
                <div className="mt-1 text-sm text-zinc-400">
                  Te gustó hace {formatTimeAgo(video.liked_at)}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {showMenu && (
        <div className="absolute z-10 top-[245px] right-2">
          <VideoCardMenu videoId={video.id} />
        </div>
      )}
    </div>
  )
}
