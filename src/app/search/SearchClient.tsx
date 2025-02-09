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
        const { data, error } = await supabase
          .from('videos')
          .select(`
            *,
            profiles: user_id (
              id,
              full_name,
              avatar_url
            )
          `)
          .or(`title.ilike.%${query}%, description.ilike.%${query}%`)
          .order('created_at', { ascending: false })

        if (error) throw error
        setVideos(data || [])
      } catch (error) {
        console.error('Error searching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    searchVideos()
  }, [query])
}
