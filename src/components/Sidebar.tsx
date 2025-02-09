'use client'

import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  History,
  PlayCircle,
  Flame,
  Music2,
  Gamepad2,
  Video,
  Clock,
  ThumbsUp,
  Radio,
  SquareChartGantt,
  Trophy,
  Lightbulb,

} from 'lucide-react'
import { MdOutlinePlaylistPlay } from "react-icons/md"
import { Separator } from "@/components/ui/separator"
import Image from 'next/image';
import { useState } from 'react'
import Link from 'next/link'
import Subscriptions from './Subscriptions'
import { useUser } from '@/hooks/useUser'
import { useLayoutStore } from '@/stores/layoutStore'

interface SidebarProps {
  isExpanded: boolean
}

interface NavItemProps {
  Icon?: React.ElementType
  label: string
  isExpanded: boolean
  showIcon?: boolean
  isActive?: boolean
}

const NavItem = ({ Icon, label, isExpanded, showIcon = true, isActive = false }: NavItemProps) => {
  return (
    <button 
      className={`
        flex w-full
        hover:bg-[#272727] transition-colors rounded-xl
        ${isExpanded 
          ? 'flex-row items-center gap-4 px-3 py-2' 
          : 'flex-col items-center py-4'
        }
        ${isActive ? 'bg-[#272727]' : ''}
      `}
    >
      {showIcon && Icon && <Icon className="w-5 h-5 text-white" />}
      <span className={`
        ${isExpanded ? 'text-sm' : 'text-[10px]'} 
        text-white font-medium
        ${!isExpanded && 'mt-1'}
      `}>
        {label}
      </span>
    </button>
  )
}

export default function Sidebar() {
  const isExpanded = useLayoutStore((state) => state.isSidebarExpanded)
  const toggleSidebar = useLayoutStore((state) => state.toggleSidebar)
  const { user } = useUser()
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  if (pathname.startsWith('/studio') || pathname.startsWith('/watch')) {
    return null
  }

  const principalItems = [
    { icon: Home, label: 'Principal', href: '/' },
    { icon: PlayCircle, label: 'Shorts', href: '/shorts' },
    { icon: Users, label: 'Suscripciones', href: '/subscriptions' },
  ]

  const tuContenido = [
    { icon: History, label: 'Historial' },
    { icon: MdOutlinePlaylistPlay, label: 'Playlist' },
    { icon: Video, label: 'Tus videos' },
    { icon: Clock, label: 'Ver mas tarde' },
    { icon: ThumbsUp, label: 'Me gustas' },
  ]

  const explorar = [
    { icon: Flame, label: 'Tendencias' },
    { icon: Music2, label: 'Música' },
    {icon:Radio, label: 'En vivo' },
    { icon: Gamepad2, label: 'Videojuegos' },
    { icon: SquareChartGantt, label: 'Noticias' },
    {icon: Trophy, label: 'Deportes' },
    { icon: Lightbulb, label: 'Aprendizaje' },
  ]

  const masYoutube = [
    { 
      icon: () => <Image src="/icons8-youtube-studio.svg" width={24} height={24} alt="YouTube Premium" />,
      label: 'YouTube Premium'
    },
    { icon: () => <Image src="/youtube-music.svg" width={24} height={24} alt="YouTube Studio" />, label: 'YouTube Studio' },
    { 
      icon: () => <Image src="/youtube_music.svg" width={24} height={24} alt="YouTube Music" />,
      label: 'YouTube Music'
    },
    { icon: () => <Image src="/youtube-kids-icon.svg" width={24} height={24} alt="YouTube Kids" />, label: 'YouTube Kids' },
  ]

  const renderSection = (items: any[], showIcon: boolean = true) => (
    items.map((item) => (
      <NavItem
        key={item.label}
        Icon={item.icon}
        label={item.label}
        isExpanded={isExpanded}
        showIcon={showIcon}
      />
    ))
  )

  return (
    <aside 
      className={`
        fixed left-0 top-14
        h-[calc(100vh-3.5rem)]
        bg-[#0f0f0f]
        transition-all duration-300
        overflow-y-auto hidden md:block
        [&::-webkit-scrollbar]:w-[8px]
        [&::-webkit-scrollbar-thumb]:bg-[#717171]
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-track]:bg-transparent
        hover:[&::-webkit-scrollbar-thumb]:bg-[#8d8d8d]
        z-40
        ${isExpanded ? 'w-60' : 'w-20'}
      `}
    >

      <div className="mt-4">
        {isExpanded ? (
          <>
            <div className="px-2 pt-2 pb-4 border-b border-zinc-800">
              {principalItems.map((item, index) => (
                <Link key={index} href={item.href}>
                  <NavItem
                    Icon={item.icon}
                    label={item.label}
                    isExpanded={isExpanded}
                    isActive={pathname === item.href}
                  />
                </Link>
              ))}
            </div>
            <div className="px-2 pt-4 pb-4 border-b border-zinc-800">
              <div className="pl-2 text-sm text-white">Tú</div>
              <Link 
                href={user ? `/channel/${user.id}` : '/auth'} 
                className={pathname === `/channel/${user?.id}` ? "bg-zinc-800 rounded-xl" : ""}
              >
                <NavItem Icon={PlayCircle} label="Tu canal" isExpanded={isExpanded} />
              </Link>
              <Link href="/history" className={pathname === "/history" ? "bg-zinc-800 rounded-xl" : ""}>
                <NavItem Icon={History} label="Historial" isExpanded={isExpanded} />
              </Link>
              <Link href="/liked-videos" className={pathname === "/liked-videos" ? "bg-zinc-800  rounded-xl" : ""}>
                <NavItem Icon={ThumbsUp} label="Mis me gustas" isExpanded={isExpanded} />
              </Link>
              <Link href="/watch-later" className={pathname === "/watch-later" ? "bg-zinc-800 rounded-xl" : ""}>
                <NavItem Icon={Clock} label="Ver más tarde" isExpanded={isExpanded} />
              </Link>
            </div>
            <Subscriptions />
            <Separator className="my-2 bg-[#3f3f3f]" />
            <div className="pb-4">
              <h3 className="px-6 py-2 text-sm font-medium text-white">Explorar</h3>
              {renderSection(explorar)}
            </div>
            
            <Separator className="my-2 bg-[#3f3f3f]" />
            <div className="pb-4">
              <h3 className="px-6 py-2 text-sm font-medium text-white">Más de YouTube</h3>
              {renderSection(masYoutube)}
            </div>
            <Separator className="my-2 bg-[#3f3f3f]" />
        
          </>
        ) : (
          <div className="px-2 pt-2">
            {principalItems.map((item, index) => (
              <Link key={index} href={item.href}>
                <NavItem
                  Icon={item.icon}
                  label={item.label}
                  isExpanded={isExpanded}
                  isActive={pathname === item.href}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}