'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { X, Upload, ArrowUpCircle, ImageIcon, Copy } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import VideoEditor from '@/components/VideoEditor/VideoEditor'
import { useDropzone } from 'react-dropzone'

// Límite de 50MB para el plan gratuito de Supabase
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

interface Advertisement {
  id: string
  timestamp: number
  duration: number
  title: string
  description: string
  type: 'overlay' | 'midroll'
  url?: string
}

interface UploadVideoProps {
  onClose: () => void
}

export default function UploadVideo({ onClose }: UploadVideoProps) {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [step, setStep] = useState<'select' | 'details' | 'editor'>('select')
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    hashtags: '',
    isPrivate: false,
    isKidsContent: false
  })
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [tempVideoUrl, setTempVideoUrl] = useState<string | null>(null)
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    if (selectedFile) {
      const tempUrl = URL.createObjectURL(selectedFile)
      setTempVideoUrl(tempUrl)
      return () => URL.revokeObjectURL(tempUrl)
    }
  }, [selectedFile])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      if (file.size > MAX_FILE_SIZE) {
        toast.error('El archivo es demasiado grande. El tamaño máximo es 50MB')
        return
      }
      setSelectedFile(file)
      setStep('details')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZE
  })

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      if (file.size > MAX_FILE_SIZE) {
        toast.error('El archivo es demasiado grande. El tamaño máximo es 50MB')
        return
      }
      setSelectedFile(file)
      setStep('details')
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor, selecciona un archivo de video válido')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo es demasiado grande. El tamaño máximo es 50MB')
      return
    }

    setSelectedFile(file)
    setVideoData(prev => ({
      ...prev,
      title: file.name.split('.')[0]
    }))
    setStep('details')
  }

  const handleUpload = async () => {
    if (!selectedFile || !videoData.title) return

    try {
      setUploading(true)
      setError(null)

      const session = await supabase.auth.getSession()
      if (!session.data.session) {
        throw new Error('Debes iniciar sesión para subir videos')
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo es 50MB')
      }

      // 1. Subir el video
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${session.data.session.user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw new Error('Error al subir el video: ' + uploadError.message)
      }

      // 2. Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      // 3. Subir la miniatura si existe
      let finalThumbnailUrl = null
      if (thumbnailUrl) {
        // Convertir base64 a Blob
        const response = await fetch(thumbnailUrl)
        const blob = await response.blob()
        const thumbnailExt = blob.type.split('/')[1]
        const thumbnailName = `thumb_${Date.now()}.${thumbnailExt}`
        const thumbnailPath = `${session.data.session.user.id}/thumbnails/${thumbnailName}`

        const { error: thumbError } = await supabase.storage
          .from('videos')
          .upload(thumbnailPath, blob, {
            cacheControl: '3600',
            upsert: false
          })

        if (thumbError) {
          console.error('Error al subir la miniatura:', thumbError)
        } else {
          const { data: { publicUrl: thumbPublicUrl } } = supabase.storage
            .from('videos')
            .getPublicUrl(thumbnailPath)
          finalThumbnailUrl = thumbPublicUrl
        }
      }

      // 4. Asegurarse de que el usuario existe en la base de datos
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.data.session.user.id)
        .single()

      if (!existingProfile) {
        // Si el perfil no existe, lo creamos
        const profileData = {
          id: session.data.session.user.id,
          email: session.data.session.user.email,
          avatar_url: session.data.session.user.user_metadata?.avatar_url || session.data.session.user.user_metadata?.picture || '',
          full_name: session.data.session.user.user_metadata?.full_name || session.data.session.user.user_metadata?.name || session.data.session.user.email?.split('@')[0] || 'Usuario',
          updated_at: new Date().toISOString()
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)

        if (profileError) {
          console.error('Error completo al crear perfil:', profileError)
          throw new Error('Error al crear el perfil de usuario')
        }
      }

      // 5. Guardar el video en la base de datos
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title: videoData.title,
          description: videoData.description || '',
          url: publicUrl,
          user_id: session.data.session.user.id,
          thumbnail_url: finalThumbnailUrl,
          views: 0,
          likes: 0,
          dislikes: 0,
          hashtags: videoData.hashtags ? videoData.hashtags.split(',').map(tag => tag.trim()) : [],
          created_at: new Date().toISOString()
        })

      if (dbError) {
        console.error('Error detallado de DB:', dbError)
        throw new Error('Error al guardar en la base de datos: ' + dbError.message)
      }

      toast.success('Video subido correctamente')
      router.refresh() // Añadir esta línea para refrescar los datos
      router.replace('/studio')
    } catch (error) {
      console.error('Error al subir:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
      toast.error(`Error al subir: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    } finally {
      setUploading(false)
    }
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setThumbnailUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClose = () => {
    if (uploading) {
      const confirmed = confirm('¿Estás seguro de que quieres cancelar la subida?')
      if (!confirmed) return
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-y-auto py-10">
      <div className="bg-[#1f1f1f] w-full max-w-3xl h-auto max-h-[85vh] rounded-xl relative mx-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#1f1f1f] border-b border-zinc-800">
          <h1 className="text-lg font-bold text-white">Subir video</h1>
          <button
            onClick={onClose}
            className="p-1.5 transition-colors rounded-full hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(85vh - 120px)' }}>
          <div className="p-4">
            {!selectedFile ? (
              <div {...getRootProps()} className={`
                border-2 border-dashed rounded-xl p-8 md:p-12
                flex flex-col items-center justify-center gap-6
                transition-colors cursor-pointer
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
                }
              `}>
                <input {...getInputProps()} />
                <Upload className={`w-12 h-12 ${isDragActive ? 'text-blue-500' : 'text-zinc-400'}`} />
                <div className="space-y-2 text-center">
                  <p className="text-lg text-zinc-300">Arrastra y suelta tu video aquí o</p>
                  <button className="font-medium text-blue-500 transition-colors hover:text-blue-400">
                    selecciona un archivo
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-500">
                  Los videos deben ser menores a 50MB
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Video Preview */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                      Vista previa del video
                    </label>
                    <div className="relative overflow-hidden rounded-lg aspect-video bg-zinc-800">
                      <video
                        src={tempVideoUrl}
                        className="w-full h-full"
                        controls
                      />
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                      Miniatura
                    </label>
                    <div className="relative overflow-hidden rounded-lg aspect-video bg-zinc-800">
                      {thumbnailUrl ? (
                        <>
                          <Image
                            src={thumbnailUrl}
                            alt="Thumbnail preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => setThumbnailUrl(null)}
                            className="absolute p-1 rounded-full top-2 right-2 bg-black/50 hover:bg-black/70"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-zinc-700/50">
                          <ImageIcon className="w-8 h-8 mb-2 text-zinc-500" />
                          <span className="text-sm text-zinc-500">Subir miniatura</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailUpload}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-400">
                    Título
                  </label>
                  <input
                    type="text"
                    value={videoData.title}
                    onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 text-white rounded-lg bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Añade un título que describa tu video"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-zinc-400">
                    Descripción
                  </label>
                  <textarea
                    value={videoData.description}
                    onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 text-white rounded-lg bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe tu video"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - solo mostrar si hay video seleccionado */}
        {selectedFile && (
          <div className="sticky bottom-0 z-10 flex justify-end gap-2 p-4 bg-[#1f1f1f] border-t border-zinc-800">
            <button
              onClick={onClose}
              className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !videoData.title}
              className="flex items-center gap-2 px-6 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 rounded-full border-white/30 border-t-white animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                'Subir video'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
