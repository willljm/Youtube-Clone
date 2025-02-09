'use client'

import dynamic from 'next/dynamic'
import { Search } from 'lucide-react'

const SearchClient = dynamic(() => import('./SearchClient'), {
  ssr: false,
  loading: () => (
    <div className="p-8">
      <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin" />
    </div>
  )
})

export default function SearchPageClient() {
  return <SearchClient />
}
