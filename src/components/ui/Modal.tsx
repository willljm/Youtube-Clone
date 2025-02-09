'use client'

import { X } from 'lucide-react'
import { ReactNode } from 'react'

interface ModalProps {
  title: string
  children: ReactNode
  onClose: () => void
}

export default function Modal({ title, children, onClose }: ModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 backdrop-blur-xl rounded-xl w-full max-w-2xl shadow-2xl border border-zinc-700/30"
      >
        <div className="flex items-center justify-between p-6 border-b border-zinc-700/30">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            {title}
          </h2>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-zinc-700/50 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  )
}
