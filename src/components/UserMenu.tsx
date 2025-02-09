'use client'

import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, 
  LogOut, 
  Settings, 
  HelpCircle, 
  Globe, 
  Moon,
  Youtube,
  DollarSign,
  Shield,
  Keyboard
} from 'lucide-react'

export default function UserMenu() {
  const { user, signOut } = useUser()

  if (!user?.user_metadata) {
    return null;
  }

  const avatarUrl = user.user_metadata.avatar_url || '/default-avatar.png'
  const fullName = user.user_metadata.full_name || 'Usuario'

  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      window.location.reload()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="overflow-hidden rounded-full w-8 h-8"
      >
        <Image
          src={avatarUrl}
          alt={fullName}
          width={32}
          height={32}
          className="object-cover"
          priority
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[#282828] rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-zinc-700">
            <div className="flex items-center space-x-2">
              <Image
                src={avatarUrl}
                alt={fullName}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <p className="font-medium text-white">{fullName}</p>
                <p className="text-sm text-gray-400">@{user.user_metadata.email}</p>
              </div>
            </div>
            <Link 
              href={`/channel/${user.id}`}
              className="mt-2 text-blue-500  hover:text-blue-400 text-sm block"
            >
              Ver tu canal
            </Link>
          </div>

          <div className="py-2 border-b text-white text-sm border-zinc-700">
            <MenuItem icon={Youtube} text="YouTube Studio" />
            <MenuItem icon={DollarSign} text="Compras y membresías" />
          </div>

          <div className="py-2 border-b text-white text-sm border-zinc-700">
            <MenuItem icon={Shield} text="Tus datos en YouTube" />
            <MenuItem icon={Moon} text="Aspecto: Tema del dispositivo" />
            <MenuItem icon={Globe} text="Idioma: español latinoamericano" />  
            <MenuItem icon={Shield} text="Modo restringido: desactivado" />
            <MenuItem icon={Globe} text="Ubicación: Colombia" />
            <MenuItem icon={Keyboard} text="Combinaciones de teclas" />
          </div>

          <div className="py-2 border-b text-white text-sm border-zinc-700">
            <MenuItem icon={Settings} text="Configuración" />
          </div>

          <div className="py-2 border-b text-white text-sm border-zinc-700">
            <MenuItem icon={HelpCircle} text="Ayuda" />
          </div>

          <div className="py-2">
            <button
              onClick={handleSignOut}
              className="w-full px-4 text-white py-2 text-left hover:bg-zinc-700 flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5 text-red-500" />
              <span className='text-red-500'>Cerrar sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuItem({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <button className="w-full px-4 py-2 text-left hover:bg-zinc-700 flex items-center space-x-2">
      <Icon className="w-5 h-5" />
      <span>{text}</span>
    </button>
  )
}
