'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Search, User } from 'lucide-react'
import SearchBar from './SearchBar'
import CreateMenu from './CreateMenu'
import NotificationsMenu from './NotificationsMenu'
import UserMenu from './UserMenu'
import Sidebar from './Sidebar'
import { useUser } from '@/hooks/useUser'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLayoutStore } from '@/stores/layoutStore'

export default function Header() {
  const { user } = useUser()
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)
  const isExpanded = useLayoutStore((state) => state.isSidebarExpanded)
  const pathname = usePathname()
  const isMainPage = pathname === '/'

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#0f0f0f] z-[100]">
      <div className="flex items-center justify-between h-full px-4 mx-auto">
        {/* Left section */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleSidebar}
            className="p-2 text-white rounded-full hover:bg-[#272727]"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>

          <Link href="/" className="flex items-center">
            <Image
              src="/yutu.svg"
              alt="YouTube"
              width={30}
              height={30}
              priority
            />
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-[600px] mx-4 hidden md:block">
          <SearchBar />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          <button 
            className="p-2 md:hidden"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
          >
            {showMobileSearch ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" />
              </svg>
            ) : (
              <Search className="w-6 h-6 text-white" />
            )}
          </button>

          <div className="items-center hidden gap-4 md:flex">
            {user && <CreateMenu />} {/* Solo se muestra si hay usuario */}
            <div className="w-px h-6 bg-zinc-700"></div>
            <NotificationsMenu />
            {user ? (
              <UserMenu />
            ) : (
              <Link
                href="/auth"
                className="flex items-center gap-2 px-3 py-1.5 text-blue-500 transition-colors border rounded-full border-[#3ea6ff] hover:bg-[#263850]"
              >
                <User size={24} />
                <span className="hidden md:block">Acceder</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {showMobileSearch && (
        <div className="absolute left-0 right-0 px-4 py-2 bg-[#0f0f0f] md:hidden">
          <SearchBar />
        </div>
      )}
    </header>
  )
}
