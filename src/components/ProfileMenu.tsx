'use client'

import { User } from '@supabase/supabase-js'
import { LogOut, Settings, HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface ProfileMenuProps {
  user: User
  onClose: () => void
  onSignOut: () => void
}

export default function ProfileMenu({ user, onClose, onSignOut }: ProfileMenuProps) {
  return (
    <div className="absolute right-0 mt-2 w-72 bg-zinc-800 rounded-xl shadow-lg py-2 z-50">
      <div className="px-4 py-2 border-b border-zinc-700">
        <div className="flex items-center gap-3">
          {user.user_metadata?.avatar_url && (
            <Image
              src={user.user_metadata.avatar_url}
              alt={user.user_metadata.full_name}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div>
            <p className="font-medium text-white">{user.user_metadata?.full_name}</p>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="py-2">
        <button className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-3">
          <Settings className="w-5 h-5" />
          <span>Configuración</span>
        </button>
        <button className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-3">
          <HelpCircle className="w-5 h-5" />
          <span>Ayuda</span>
        </button>
        <button 
          onClick={() => {
            onSignOut()
            onClose()
          }}
          className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center gap-3 text-red-500"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
