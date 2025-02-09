'use client'

import { useState } from 'react'
import { Search, Mic } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-4">
      <div className="flex items-center flex-grow">
        <div className={`flex flex-grow items-center border border-[#303030] rounded-l-full ${
          isSearchFocused ? 'border-blue-500' : ''
        }`}>
          {isSearchFocused && (
            <div className="pl-4">
              <Search className="w-5 h-5 text-white" />
            </div>
          )}
          <input
            type="search"
            placeholder="Buscar"
            className="w-full px-4 py-2 bg-[#121212] outline-none text-white placeholder-[#888] rounded-l-full"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          className="px-6 py-[10px] bg-[#272727] border-l-0 border border-[#303030] rounded-r-full hover:bg-[#3f3f3f]"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>
      <button type="button" className="p-2 hover:bg-[#272727] rounded-full">
        <Mic className="w-5 h-5 text-white" />
      </button>
    </form>
  )
}
