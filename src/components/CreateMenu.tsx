'use client'

import { useRouter } from 'next/navigation'
import { Menu } from '@headlessui/react'
import { VideoIcon, Radio, PencilLine } from 'lucide-react'
import { useState } from 'react'

export default function CreateMenu() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleUploadClick = () => {
    setIsOpen(false)
    router.push('/studio/upload')
  }

  const handleClose = () => setIsOpen(false)

  return (
    <Menu as="div" className="relative">
      <Menu.Button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-700 ${
          isOpen ? 'bg-zinc-700' : ''
        }`}
      >
        <VideoIcon className="w-6 h-6 text-white" />
      </Menu.Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <Menu.Items 
            className="absolute right-0 mt-2 w-52 bg-[#282828] rounded-xl shadow-lg py-1 z-50"
          >
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleUploadClick}
                  className={`${
                    active ? 'bg-zinc-700/50' : ''
                  } flex items-center gap-3 w-full px-4 py-2.5 text-[15px] text-white`}
                >
                  <VideoIcon className="w-5 h-5" />
                  Subir video
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleClose}
                  className={`${
                    active ? 'bg-zinc-700/50' : ''
                  } flex items-center gap-3 w-full px-4 py-2.5 text-[15px] text-white`}
                >
                  <Radio className="w-5 h-5" />
                  Transmitir en vivo
                </button>
              )}
            </Menu.Item>

            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleClose}
                  className={`${
                    active ? 'bg-zinc-700/50' : ''
                  } flex items-center gap-3 w-full px-4 py-2.5 text-[15px] text-white`}
                >
                  <PencilLine className="w-5 h-5" />
                  Crear publicación
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </>
      )}
    </Menu>
  )
}
