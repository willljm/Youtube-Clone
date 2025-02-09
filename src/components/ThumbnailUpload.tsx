'use client'

import { Upload, Wand2, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface ThumbnailUploadProps {
  onThumbnailSelect: (file: File) => void
}

export default function ThumbnailUpload({ onThumbnailSelect }: ThumbnailUploadProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-white text-lg font-medium mb-2">Miniatura</h3>
        <p className="text-zinc-400 text-sm mb-1">
          Establece una miniatura que se destaque del resto y llame la atención de los usuarios.{' '}
          <Link href="#" className="text-blue-400 hover:text-blue-300">
            Más información
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button className="aspect-video bg-zinc-800 border border-dashed border-zinc-600 rounded-lg p-4 hover:bg-zinc-700/50 transition-colors flex flex-col items-center justify-center space-y-2">
          <Upload className="w-8 h-8 text-zinc-400" />
          <span className="text-white text-sm">Subir archivo</span>
        </button>

        <button className="aspect-video bg-zinc-800 border border-dashed border-zinc-600 rounded-lg p-4 hover:bg-zinc-700/50 transition-colors flex flex-col items-center justify-center space-y-2">
          <Wand2 className="w-8 h-8 text-zinc-400" />
          <span className="text-white text-sm">Generar automáticamente</span>
        </button>

        <button className="aspect-video bg-zinc-800 border border-dashed border-zinc-600 rounded-lg p-4 hover:bg-zinc-700/50 transition-colors flex flex-col items-center justify-center space-y-2">
          <BarChart3 className="w-8 h-8 text-zinc-400" />
          <span className="text-white text-sm">Probar y comparar</span>
        </button>
      </div>
    </div>
  )
}
