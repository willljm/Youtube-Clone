import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'

export default function SettingsMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const menuItems = [
    {
      label: 'Aspecto: Tema del dispositivo',
      onClick: () => console.log('theme')
    },
    {
      label: 'Idioma: Español latinoamericano',
      onClick: () => console.log('language')
    },
    {
      label: 'Modo restringido: desactivado',
      onClick: () => console.log('restricted')
    },
    {
      label: 'Ubicación: Colombia',
      onClick: () => console.log('location')
    },
    {
      label: 'Combinaciones de teclas',
      onClick: () => console.log('shortcuts')
    },
    {
      label: 'Configuración',
      onClick: () => console.log('settings')
    },
    {
      label: 'Ayuda',
      onClick: () => console.log('help')
    },
    {
      label: 'Enviar comentarios',
      onClick: () => console.log('feedback')
    }
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-zinc-800 rounded-full"
      >
        <MoreVertical className="text-white w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-zinc-800 rounded-xl shadow-lg py-2 z-50">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full px-4 py-2 text-left hover:bg-zinc-700 text-white text-sm"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
