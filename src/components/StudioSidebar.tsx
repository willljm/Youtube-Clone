'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  LayoutDashboard,
  BarChart2, 
  Users, 
  FileText, 
  Copyright,
  DollarSign,
  Settings,
  MessageSquare,
  Paintbrush,
  Music,
  Play
} from 'lucide-react'
import { useUser } from '@/hooks/useUser'

export default function StudioSidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  const menuItems = [
    { href: '/studio', icon: LayoutDashboard, label: 'Panel' },
    { href: '/studio/content', icon: Play, label: 'Contenido' },
    { href: '/studio/analytics', icon: BarChart2, label: 'Analytics' },
    { href: '/studio/community', icon: Users, label: 'Comunidad' },
    { href: '/studio/subtitles', icon: FileText, label: 'Subtítulos' },
    { href: '/studio/copyright', icon: Copyright, label: 'Derechos de autor' },
    { href: '/studio/earnings', icon: DollarSign, label: 'Ingresos' },
    { href: '/studio/customization', icon: Paintbrush, label: 'Personalización' },
    { href: '/studio/audio-library', icon: Music, label: 'Biblioteca de audio' },
    { href: '/studio/settings', icon: Settings, label: 'Configuración' },
    { href: '/studio/feedback', icon: MessageSquare, label: 'Enviar comentarios' }
  ]

  return (
    <>
      {/* Botón flotante para subir videos en móvil */}
      <Link
        href="/studio?upload=true"
        className="fixed right-4 bottom-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg md:hidden"
      >
        <Play className="w-6 h-6" />
      </Link>

      {/* Sidebar para desktop */}
      <nav className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-[240px] bg-[#0f0f0f] border-r border-zinc-800 z-40 hidden md:block">
        <div className="flex flex-col h-full">
          {/* Perfil */}
          <div className="p-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-full overflow-hidden">
                <Image
                  src={user?.user_metadata?.avatar_url || '/avatar-placeholder.png'}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-white font-medium">Tu canal</h2>
                <p className="text-sm text-zinc-400">{user?.user_metadata?.full_name || 'Usuario'}</p>
              </div>
            </div>
          </div>

          {/* Menú */}
          <nav className="flex-1 py-2 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-6 py-2.5 transition-colors relative ${
                    isActive 
                      ? 'bg-zinc-800 hover:bg-zinc-700/80' 
                      : 'hover:bg-zinc-800/50'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white" />
                  )}
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-zinc-400'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>
      </nav>

      {/* Menú móvil para Studio */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f0f] border-t border-zinc-800 md:hidden">
        <div className="flex justify-around p-2">
          {menuItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 ${
                pathname === item.href ? 'text-white' : 'text-zinc-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
