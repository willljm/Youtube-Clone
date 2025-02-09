'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Filter, Lock, Globe, Pencil, Clock, ThumbsUp, MessageSquare, Eye, Check } from 'lucide-react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { formatViewCount } from '@/utils/format'
import Link from 'next/link'
import VideoEditForm from './VideoEditForm'

interface Video {
  id: string
  title: string
  description: string
  thumbnail_url: string | null
  url: string
  views: number
  likes: number
  dislikes: number
  created_at: string
  user_id: string
  is_for_kids: boolean
  comments: number
}

interface Column {
  id: keyof Video | 'actions'
  label: string
  sortable?: boolean
  width?: string
}

const columns: Column[] = [
  { id: 'title', label: 'Video', sortable: true, width: '35%' },
  { id: 'is_for_kids', label: 'Restricciones', sortable: true, width: '15%' },
  { id: 'created_at', label: 'Fecha', sortable: true, width: '15%' },
  { id: 'views', label: 'Vistas', sortable: true, width: '10%' },
  { id: 'comments', label: 'Comentarios', sortable: true, width: '10%' },
  { id: 'likes', label: 'Me gusta (%)', sortable: true, width: '10%' },
  { id: 'actions', label: '', width: '5%' }
]

export default function StudioContent() {
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set())
  const [sortColumn, setSortColumn] = useState<keyof Video>('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)

  const loadVideos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', session.user.id)
        .order(sortColumn, { ascending: sortDirection === 'asc' })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [sortColumn, sortDirection])

  const handleDeleteVideos = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar los videos seleccionados?')) return

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .in('id', Array.from(selectedVideos))

      if (error) throw error

      // También eliminar los archivos de video y miniaturas
      for (const videoId of selectedVideos) {
        const video = videos.find(v => v.id === videoId)
        if (video) {
          if (video.url) {
            const videoKey = video.url.split('/').pop()
            if (videoKey) {
              await supabase.storage.from('videos').remove([videoKey])
            }
          }
          if (video.thumbnail_url) {
            const thumbnailKey = video.thumbnail_url.split('/').pop()
            if (thumbnailKey) {
              await supabase.storage.from('thumbnails').remove([thumbnailKey])
            }
          }
        }
      }

      setSelectedVideos(new Set())
      loadVideos()
    } catch (error) {
      console.error('Error deleting videos:', error)
      alert('Error al eliminar los videos')
    }
  }

  const handleEditVideo = async (video: Video) => {
    setEditingVideo(video)
  }

  const handleUpdateVideo = async (videoId: string, updates: Partial<Video>) => {
    try {
      const { error } = await supabase
        .from('videos')
        .update(updates)
        .eq('id', videoId)

      if (error) throw error

      setEditingVideo(null)
      loadVideos()
    } catch (error) {
      console.error('Error updating video:', error)
      alert('Error al actualizar el video')
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVideos(new Set(videos.map(v => v.id)))
    } else {
      setSelectedVideos(new Set())
    }
  }

  const handleSelectVideo = (videoId: string, checked: boolean) => {
    const newSelected = new Set(selectedVideos)
    if (checked) {
      newSelected.add(videoId)
    } else {
      newSelected.delete(videoId)
    }
    setSelectedVideos(newSelected)
  }

  const handleSort = (columnId: keyof Video) => {
    if (columnId === sortColumn) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  const formatDate = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es })
  }

  const getLikePercentage = (likes: number, dislikes: number) => {
    const total = likes + dislikes
    if (total === 0) return 0
    return Math.round((likes / total) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#282828] text-white p-6 flex items-center justify-center">
        <div className="text-xl">Cargando videos...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#282828] text-white p-6">
      {editingVideo && (
        <VideoEditForm
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onUpdate={loadVideos}
        />
      )}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Contenido del canal</h1>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-zinc-700/50 rounded-sm hover:bg-zinc-700 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filtrar</span>
            </button>
            
            {selectedVideos.size > 0 && (
              <button 
                onClick={handleDeleteVideos}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600/80 rounded-sm hover:bg-red-600 transition-colors"
              >
                <span>Eliminar seleccionados</span>
              </button>
            )}
          </div>
          
          {selectedVideos.size > 0 && (
            <div className="text-sm text-zinc-400">
              {selectedVideos.size} videos seleccionados
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1f1f1f] rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="p-4 text-left w-[40px]">
                <div className="relative inline-block">
                  <input
                    type="checkbox"
                    checked={selectedVideos.size === videos.length && videos.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="peer absolute opacity-0 w-5 h-5 cursor-pointer"
                  />
                  <div className="w-5 h-5 border-2 border-zinc-600 rounded-sm peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors">
                    <Check className={`w-4 h-4 text-white transition-opacity ${
                      selectedVideos.size === videos.length && videos.length > 0 ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>
                </div>
              </th>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={{ width: column.width }}
                  className={`p-4 text-left text-sm font-medium text-zinc-400 ${
                    column.sortable ? 'cursor-pointer hover:text-white' : ''
                  }`}
                  onClick={() => column.sortable && column.id !== 'actions' && handleSort(column.id as keyof Video)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && column.id === sortColumn && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortDirection === 'desc' ? 'transform rotate-180' : ''
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {videos.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-zinc-400">
                  No hay videos disponibles. ¡Sube tu primer video!
                </td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr key={video.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="p-4">
                    <div className="relative inline-block">
                      <input
                        type="checkbox"
                        checked={selectedVideos.has(video.id)}
                        onChange={(e) => handleSelectVideo(video.id, e.target.checked)}
                        className="peer absolute opacity-0 w-5 h-5 cursor-pointer"
                      />
                      <div className="w-5 h-5 border-2 border-zinc-600 rounded-sm peer-checked:bg-blue-500 peer-checked:border-blue-500 transition-colors">
                        <Check className={`w-4 h-4 text-white transition-opacity ${
                          selectedVideos.has(video.id) ? 'opacity-100' : 'opacity-0'
                        }`} />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-16 relative bg-zinc-800 rounded overflow-hidden flex-shrink-0">
                        {video.thumbnail_url ? (
                          <Image
                            src={video.thumbnail_url}
                            alt={video.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-zinc-600">Sin miniatura</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Link href={`/watch/${video.id}`} className="text-blue-500 hover:underline">
                          {video.title}
                        </Link>
                        <p className="text-sm text-zinc-400 line-clamp-2">{video.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {video.is_for_kids ? (
                      <span className="inline-flex items-center gap-1 text-sm text-yellow-500">
                        <Lock className="w-4 h-4" /> Para niños
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-green-500">
                        <Globe className="w-4 h-4" /> Sin restricciones
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-center">{formatDate(video.created_at)}</td>
                  <td className="p-4 text-sm text-center">{formatViewCount(video.views)}</td>
                  <td className="p-4 text-sm text-center">{video.comments}</td>
                  <td className="p-4 text-sm text-center">{getLikePercentage(video.likes, video.dislikes)}%</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEditVideo(video)}
                      className="p-2 hover:bg-zinc-700 rounded-full transition-colors"
                      title="Editar video"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
