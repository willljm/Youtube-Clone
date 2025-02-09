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

  // ...existing code...  (mantener el resto del código del componente original)
}
