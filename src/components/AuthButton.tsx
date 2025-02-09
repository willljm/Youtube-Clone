'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import Image from 'next/image'
import ProfileMenu from './ProfileMenu'
import CreateMenu from './CreateMenu'

export default function AuthButton() {
  const { user, loading } = useUser()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
  }

  if (loading) {
    return (
      <div className="w-8 h-8 animate-pulse bg-[#222222] rounded-full" />
    )
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className="flex items-center gap-2 bg-[#222222] text-white px-4 py-2 rounded-full hover:bg-[#3f3f3f] transition-colors"
      >
        Acceder
      </button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="hover:opacity-80 transition-opacity"
      >
        {user.user_metadata?.avatar_url && (
          <Image
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata.full_name}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
      </button>
      
      {showMenu && (
        <ProfileMenu 
          user={user} 
          onClose={() => setShowMenu(false)} 
        />
      )}
    </div>
  )
}
