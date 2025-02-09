'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { supabase } from '@/lib/supabase'
import { Upload, X, ImagePlus } from 'lucide-react'
import Image from 'next/image'
import VideoEditor from '@/components/VideoEditor/VideoEditor'
import { toast } from 'sonner' // Cambiado de react-toastify a sonner

export default function UploadPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'editor'>('details')
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setVideoFile(acceptedFiles[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1
  })

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClose = () => {
    if (uploading) {
      const shouldClose = window.confirm('¿Estás seguro que deseas cancelar la subida?')
      if (!shouldClose) return
    }
    router.back() // Usar router.back() en lugar de push para volver a la página anterior
  }

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) {
      toast.error('El título es requerido')
      return
    }

    try {
      setUploading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Sesión no válida')
        return
      }

      // 1. Subir video
      const videoFileName = `${Date.now()}-${videoFile.name.replace(/\s+/g, '-')}`
      const filePath = `uploads/${session.user.id}/${videoFileName}`

      console.log('Iniciando subida del video:', { filePath })

      const { error: uploadError, data: videoData } = await supabase.storage
        .from('videos')
        .upload(filePath, videoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error al subir video:', uploadError)
        throw new Error(`Error en la subida: ${uploadError.message}`)
      }

      // 2. Obtener URL pública
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      if (!videoUrl) {
        throw new Error('No se pudo obtener la URL del video')
      }

      // 3. Crear registro en la base de datos
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title: title.trim(),
          description: description.trim(),
          url: videoUrl,
          thumbnail_url: thumbnailPreview || null,
          user_id: session.user.id
        })

      if (dbError) {
        console.error('Error en base de datos:', dbError)
        throw new Error(`Error al guardar: ${dbError.message}`)
      }

      toast.success('Video subido exitosamente')
      router.replace('/studio')
    } catch (error: any) {
      console.error('Error completo:', error)
      toast.error(error.message || 'Error al subir el video')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1f1f1f] w-full max-w-4xl rounded-2xl relative">
        {/* Header - Fixed */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#1f1f1f] border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-white">Subir video</h1>
          <button
            onClick={handleClose}
            className="p-2 transition-colors rounded-full hover:bg-zinc-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="p-6">
            {!videoFile ? (
              <div {...getRootProps()} className={`
                border-2 border-dashed rounded-xl p-12
                flex flex-col items-center justify-center gap-6
                transition-colors cursor-pointer
                ${isDragActive 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-zinc-700 hover:border-zinc-500 hover:bg-zinc-800/50'
                }
              `}>
                <input {...getInputProps()} />
                <Upload className={`w-16 h-16 ${isDragActive ? 'text-blue-500' : 'text-zinc-400'}`} />
                <div className="space-y-2 text-center">
                  <p className="text-lg text-zinc-300">Arrastra y suelta tu video aquí o</p>
                  <button className="font-medium text-blue-500 transition-colors hover:text-blue-400">
                    selecciona un archivo
                  </button>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  Tus videos permanecerán privados hasta que los publiques
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  {/* Video Preview */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                      Vista previa del video
                    </label>
                    <div className="relative overflow-hidden rounded-lg aspect-video bg-zinc-800">
                      <video
                        ref={videoPreviewRef}
                        src={URL.createObjectURL(videoFile)}
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
                      {thumbnailPreview ? (
                        <>
                          <Image
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => setThumbnailPreview(null)}
                            className="absolute p-1 rounded-full top-2 right-2 bg-black/50 hover:bg-black/70"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-zinc-700/50">
                          <ImagePlus className="w-8 h-8 mb-2 text-zinc-500" />
                          <span className="text-sm text-zinc-500">Subir miniatura</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleThumbnailSelect}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mb-6 border-b border-zinc-700">
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'details'
                        ? 'text-white border-b-2 border-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('details')}
                  >
                    Detalles
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'editor'
                        ? 'text-white border-b-2 border-white'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                    onClick={() => setActiveTab('editor')}
                  >
                    Editor
                  </button>
                </div>

                {activeTab === 'details' ? (
                  <>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-zinc-400">
                        Archivo seleccionado
                      </label>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800">
                        <span className="text-white">{videoFile.name}</span>
                        <button
                          onClick={() => setVideoFile(null)}
                          className="p-1 rounded-full hover:bg-zinc-700"
                        >
                          <X className="w-5 h-5 text-zinc-400" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="title" className="block mb-2 text-sm font-medium text-zinc-400">
                        Título
                      </label>
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 text-white rounded-lg bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Añade un título que describa tu video"
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block mb-2 text-sm font-medium text-zinc-400">
                        Descripción
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 text-white rounded-lg bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Cuéntales a los espectadores sobre tu video"
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-[500px]">
                    <VideoEditor videoUrl={URL.createObjectURL(videoFile)} />
                  </div>
                )}

                {uploading && (
                  <div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full transition-all duration-300 bg-blue-500"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">
                      Subiendo... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        {videoFile && (
          <div className="sticky bottom-0 z-10 flex justify-end gap-4 px-6 py-4 bg-[#1f1f1f] border-t border-zinc-800">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !title}
              className={`
                px-6 py-2.5 rounded-lg font-medium
                ${uploading 
                  ? 'bg-zinc-800 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'}
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center gap-2
              `}
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
