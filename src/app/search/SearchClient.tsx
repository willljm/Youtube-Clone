'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import SearchVideoCard from '@/components/SearchVideoCard'
import { Search } from 'lucide-react'
import type { Video, Channel } from '@/types'

interface SearchVideo extends Video {
  user: Channel
}

export default function SearchClient() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const [videos, setVideos] = useState<SearchVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function searchVideos() {
      if (!query) {
        setVideos([])
        setLoading(false)
        return
      }

      try {
        const searchQuery = query.toLowerCase().trim()
        const { data, error } = await supabase
          .from('videos')
          .select(`
            *,
            profiles:user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })

        if (error) throw error
        console.log('Search results:', data) // Para depuración
        setVideos(data || [])
      } catch (error) {
        console.error('Error searching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    if (query) {
      searchVideos()
    }
  }, [query])

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
        </div>
      ) : (
        <>
          <h2 className="mb-4 text-xl">
            Resultados para: {query}
          </h2>
          <div className="space-y-4">
            {videos.map((video) => (
              <SearchVideoCard key={video.id} video={video} />
            ))}
            {videos.length === 0 && (
              <p>No se encontraron resultados para "{query}"</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
