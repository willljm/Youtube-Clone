'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Modal from './ui/Modal'
import VideoEditor from './VideoEditor/VideoEditor'

interface Video {
  id: string
  title: string
  description: string
  is_private: boolean
  is_kids_content: boolean
  hashtags: string[]
}

interface VideoEditFormProps {
  video: Video
  onClose: () => void
  onUpdate: () => void
}

export default function VideoEditForm({ video, onClose, onUpdate }: VideoEditFormProps) {
  const [title, setTitle] = useState(video.title)
  const [description, setDescription] = useState(video.description)
  const [isPrivate, setIsPrivate] = useState(video.is_private)
  const [isKids, setIsKids] = useState(video.is_kids_content)
  const [hashtags, setHashtags] = useState(video.hashtags.join(', '))
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'ads'>('details')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) {
      setError('El título es requerido')
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('videos')
        .update({
          title,
          description,
          is_private: isPrivate,
          is_kids_content: isKids,
          hashtags: hashtags.split(',').filter(tag => tag.trim()).map(tag => tag.trim())
        })
        .eq('id', video.id)

      if (updateError) throw updateError

      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error al actualizar el video:', error)
      setError('Error al actualizar el video')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal title="Editar video" onClose={onClose}>
      <div className="flex gap-2 mb-6 border-b border-zinc-800">
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
            activeTab === 'ads'
              ? 'text-white border-b-2 border-white'
              : 'text-zinc-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('ads')}
        >
          Anuncios
        </button>
      </div>

      {activeTab === 'details' ? (
        <>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
                Título
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Título del video"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input min-h-[120px] resize-y"
                placeholder="Describe tu video"
              />
            </div>

            <div>
              <label htmlFor="hashtags" className="block text-sm font-medium text-zinc-300 mb-2">
                Hashtags
              </label>
              <input
                type="text"
                id="hashtags"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="form-input"
                placeholder="Separa los hashtags con comas"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="checkbox-input"
                />
                <div className="checkbox-box">
                  {isPrivate && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="checkbox-label">Video privado</span>
              </label>

              <label className="checkbox-wrapper">
                <input
                  type="checkbox"
                  checked={isKids}
                  onChange={(e) => setIsKids(e.target.checked)}
                  className="checkbox-input"
                />
                <div className="checkbox-box">
                  {isKids && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="checkbox-label">Contenido para niños</span>
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <VideoEditor videoUrl={`/api/videos/${video.id}`} />
      )}
    </Modal>
  )
}
