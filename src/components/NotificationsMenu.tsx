'use client'

import { useState, useEffect } from 'react'
import { Bell, Settings2, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Notification {
  id: string
  video: {
    id: string
    title: string
    thumbnail_url: string
    created_at: string
  }
  channel: {
    id: string
    full_name: string
    avatar_url: string
  }
}

export default function NotificationsMenu() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [hasUnread, setHasUnread] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    async function loadNotifications() {
      if (!user) return

      try {
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('channel_id')
          .eq('subscriber_id', user.id)

        if (!subscriptions?.length) {
          setLoading(false)
          return
        }

        const channelIds = subscriptions.map(sub => sub.channel_id)

        const { data: videos } = await supabase
          .from('videos')
          .select(`
            id,
            title,
            thumbnail_url,
            created_at,
            channel:user_id (
              id,
              user_metadata->>full_name as full_name,
              user_metadata->>avatar_url as avatar_url
            )
          `)
          .in('user_id', channelIds)
          .order('created_at', { ascending: false })
          .limit(20)

        if (videos) {
          setNotifications(videos as any)
          const hasNewVideos = videos.some(video => {
            const videoDate = new Date(video.created_at)
            const now = new Date()
            const diffHours = (now.getTime() - videoDate.getTime()) / (1000 * 60 * 60)
            return diffHours <= 24
          })
          setHasUnread(hasNewVideos)
        }
      } catch (error) {
        console.error('Error al cargar notificaciones:', error)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      loadNotifications()
    }
  }, [user, open])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 hover:bg-[#272727] rounded-full">
          <Bell className="w-6 h-6 text-white" />
          {hasUnread && (
            <span className="absolute top-1 right-1.5 w-[18px] h-[18px] bg-red-600 rounded-full flex items-center justify-center text-[11px] font-medium">
              <span className="animate-pulse">●</span>
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[480px] p-0 bg-[#0f0f0f] border-[#272727] text-white shadow-xl"
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-[#272727]">
          <h2 className="text-base font-medium">Notificaciones</h2>
          <button className="p-2 hover:bg-[#272727] rounded-full">
            <Settings2 className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center p-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <Bell className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-base text-gray-400">
                Aún no tienes notificaciones
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Las notificaciones sobre tus suscripciones aparecerán aquí
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div key={notification.id} className="group relative">
                  <Link
                    href={`/watch/${notification.id}`}
                    className="flex gap-3 p-4 hover:bg-[#272727] transition-colors"
                  >
                    <div className="relative w-[120px] aspect-video rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={notification.video.thumbnail_url}
                        alt={notification.video.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={notification.channel.avatar_url || '/default-avatar.png'}
                            alt={notification.channel.full_name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-[13px] font-medium line-clamp-2 text-white">
                            {notification.channel.full_name} subió: {notification.video.title}
                          </p>
                          <p className="text-xs text-[#AAAAAA] mt-1">
                            {formatDistanceToNow(new Date(notification.video.created_at), { 
                              addSuffix: true,
                              locale: es 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                  <button 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[#3f3f3f] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                  >
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
