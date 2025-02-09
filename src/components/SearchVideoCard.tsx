'use client'

import { useState } from 'react'
import Image from 'next/image'
import VideoCardMenu from './VideoCardMenu'
import Link from 'next/link'
import { Video } from '@/types/video'
import { formatTimeAgo } from '@/utils/format'

export default function SearchVideoCard({ video }: { video: Video }) {
  const [showMenu, setShowMenu] = useState(false)

  // Usar tanto profiles como profile para compatibilidad
  const profile = video.profiles || video.profile
  const channelName = profile?.full_name || 'Usuario desconocido'
  const channelAvatar = profile?.avatar_url || '/default-avatar.png'
  const channelId = profile?.id || video.user_id
  const channelEmail = profile?.email || ''

  return (
    <div 
      className="flex flex-col md:flex-row gap-4"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      {/* Miniatura */}
      <Link href={`/watch/${video.id}`} className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden group">
        <Image
          src={video.thumbnail_url}
          alt={video.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute bottom-2 right-2 px-1 py-0.5 bg-black/80 text-white text-xs rounded">
          {video.duration}
        </div>
      </Link>

      {/* Información del video */}
      <div className="flex-1">
        <Link href={`/watch/${video.id}`}>
          <h3 className="text-base font-medium text-white hover:text-blue-500 transition-colors line-clamp-2">
            {video.title}
          </h3>
        </Link>

        <div className="mt-1 text-sm text-zinc-400">
          <span>{video.views.toLocaleString()} visualizaciones</span>
          <span className="mx-1">•</span>
          <span>
            {formatTimeAgo(new Date(video.created_at))}
          </span>
        </div>

        <Link href={`/channel/${channelId}`} className="mt-2 flex items-center gap-2 group">
          <div className="relative w-6 h-6 rounded-full overflow-hidden">
            <Image
              src={channelAvatar}
              alt={channelName}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">
            {channelName}
          </span>
        </Link>
        <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
          {video.description}
        </p>
      </div>

      {showMenu && (
        <div className="absolute right-2 top-2">
          <VideoCardMenu video={video} />
        </div>
      )}
    </div>
  )
}
