'use client'

import { Home, Compass, PlaySquare, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import Image from 'next/image'

export default function MobileNav() {
  const { user } = useUser()
  const pathname = usePathname()

  if (pathname.startsWith('/studio') || pathname.startsWith('/watch')) {
    return null
  }

  const links = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/explore', icon: Compass, label: 'Explorar' },
    ...(user ? [{ href: '/studio', icon: PlaySquare, label: 'Crear' }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block bg-[#0f0f0f] border-t border-zinc-800 md:hidden">
      <div className="flex items-center justify-around h-16">
        {links.map((link) => (
          <Link 
            key={link.href} 
            href={link.href}
            className="flex flex-col items-center justify-center flex-1 py-2 transition-colors hover:text-white"
          >
            <link.icon 
              className={`w-6 h-6 mb-1 ${
                pathname === link.href ? 'text-white' : 'text-zinc-400'
              }`}
            />
            <span className={`text-xs ${
              pathname === link.href ? 'text-white' : 'text-zinc-400'
            }`}>
              {link.label}
            </span>
          </Link>
        ))}

        {/* Perfil/Acceder */}
        <Link
          href={user ? `/channel/${user.id}` : '/auth'}
          className="flex flex-col items-center justify-center flex-1 py-2"
        >
          {user ? (
            <>
              <div className="relative w-6 h-6 mb-1 overflow-hidden rounded-full">
                <Image
                  src={user.user_metadata?.avatar_url || '/avatar-placeholder.png'}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              </div>
              <span className={`text-xs ${
                pathname === `/channel/${user.id}` ? 'text-white' : 'text-zinc-400'
              }`}>
                Tú
              </span>
            </>
          ) : (
            <>
              <User className="w-6 h-6 mb-1 text-zinc-400" />
              <span className="text-xs text-zinc-400">
                Acceder
              </span>
            </>
          )}
        </Link>
      </div>
    </nav>
  )
}
