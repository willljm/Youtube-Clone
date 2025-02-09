'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Settings, LogOut, Clock, ThumbsUp, History, PlaySquare } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'

export default function UserProfileMenu() {
  const router = useRouter()
  const { user } = useUser()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="flex items-center gap-4 p-4 border-b border-[#272727]">
        {user.user_metadata?.avatar_url ? (
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name || 'User'}
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#272727]" />
        )}
        <div>
          <h2 className="font-medium">{user.user_metadata?.full_name || 'Usuario'}</h2>
          <p className="text-sm text-zinc-400">{user.email}</p>
        </div>
      </div>

      <div className="py-2">
        <Link href="/watch-later" className="flex items-center gap-4 px-4 py-3 hover:bg-[#272727]">
          <Clock size={20} />
          <span>Ver más tarde</span>
        </Link>
        <Link href="/liked-videos" className="flex items-center gap-4 px-4 py-3 hover:bg-[#272727]">
          <ThumbsUp size={20} />
          <span>Videos que me gustan</span>
        </Link>
        <Link href="/history" className="flex items-center gap-4 px-4 py-3 hover:bg-[#272727]">
          <History size={20} />
          <span>Historial</span>
        </Link>
        <Link href="/your-videos" className="flex items-center gap-4 px-4 py-3 hover:bg-[#272727]">
          <PlaySquare size={20} />
          <span>Tus videos</span>
        </Link>
      </div>

      <div className="border-t border-[#272727] py-2">
        <Link href="/settings" className="flex items-center gap-4 px-4 py-3 hover:bg-[#272727]">
          <Settings size={20} />
          <span>Configuración</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#272727] text-left"
        >
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
