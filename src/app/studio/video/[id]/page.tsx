'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/hooks/useUser'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface VideoData {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  user_id: string
}

export default function VideoEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useUser()
  const [video, setVideo] = useState<VideoData | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        // Verificar que el video pertenece al usuario
        if (data.user_id !== user?.id) {
          toast.error('No tienes permiso para editar este video')
          router.push('/')
          return
        }

        setVideo(data)
        setTitle(data.title)
        setDescription(data.description)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al cargar el video')
      }
    }

    if (params.id && user) {
      fetchVideo()
    }
  }, [params.id, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!video) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from('videos')
        .update({
          title,
          description,
        })
        .eq('id', video.id)
        .eq('user_id', user?.id)

      if (error) throw error

      toast.success('Video actualizado correctamente')
      router.push(`/watch/${video.id}`)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el video')
    } finally {
      setIsLoading(false)
    }
  }

  if (!video) return null

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Editar video</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Preview del video */}
        <div>
          <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden">
            <video
              src={video.video_url}
              controls
              className="w-full h-full"
            />
          </div>
          {video.thumbnail_url && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Miniatura</h3>
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image
                  src={video.thumbnail_url}
                  alt="Miniatura del video"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Formulario de edición */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Título
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 bg-zinc-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push(`/watch/${video.id}`)}
              className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
