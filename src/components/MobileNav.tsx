'use client'

import { Home, Compass, PlaySquare, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MobileNav() {
  const { user } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url)
    }
  }, [user])

  if (pathname.startsWith('/studio') || pathname.startsWith('/watch')) {
    return null
  }

  const handleCreate = () => {
    if (!user) {
      router.push('/auth')
      return
    }
    router.push('/studio/upload')
  }

  const links = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/explore', icon: Compass, label: 'Explorar' },
    {
      onClick: handleCreate,
      icon: PlaySquare,
      label: 'Crear'
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block bg-[#0f0f0f] border-t border-zinc-800 md:hidden">
      <div className="flex items-center justify-around h-16">
        {links.map((link, index) => (
          <button
            key={index}
            onClick={link.onClick || (() => router.push(link.href))}
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
          </button>
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
                  src={avatarUrl || '/default-avatar.png'}
                  alt="Avatar"
                  width={24}
                  height={24}
                  className="rounded-full"
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
