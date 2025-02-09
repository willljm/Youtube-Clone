'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import Image from 'next/image'
import Link from 'next/link'
import { formatViewCount } from '@/utils/format'

export default function StudioPage() {
  const { user } = useUser()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVideos() {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setVideos(data || [])
      } catch (error) {
        console.error('Error loading videos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadVideos()
  }, [user])

  if (loading) {
    return <div className="p-8">Cargando...</div>
  }

  return (
    <div className="p-4 md:p-8">
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="text-2xl font-bold text-white">Contenido del canal</h1>
          <p className="text-zinc-400">{videos.length} videos</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-zinc-800/50">
              <tr>
                <th className="px-4 py-3">Video</th>
                <th className="hidden px-4 py-3 md:table-cell">Fecha</th>
                <th className="hidden px-4 py-3 md:table-cell">Vistas</th>
              </tr>
            </thead>
            <tbody>
              {videos.map(video => (
                <tr key={video.id} className="border-b border-zinc-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Link href={`/watch/${video.id}`} className="relative flex-shrink-0 w-24 overflow-hidden rounded md:w-32 aspect-video group">
                        {video.thumbnail_url && (
                          <Image
                            src={video.thumbnail_url}
                            alt={video.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                        <div className="absolute inset-0 transition-colors bg-black/20 group-hover:bg-black/0" />
                      </Link>
                      <div>
                        <Link 
                          href={`/watch/${video.id}`}
                          className="font-medium text-white transition-colors hover:text-blue-500"
                        >
                          {video.title}
                        </Link>
                        <p className="text-sm text-zinc-400">{video.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell text-zinc-400">
                    {formatDistanceToNow(new Date(video.created_at), {
                      addSuffix: true,
                      locale: es
                    })}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell text-zinc-400">
                    {formatViewCount(video.views || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {videos.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-zinc-400">No tienes videos subidos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
