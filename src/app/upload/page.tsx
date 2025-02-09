'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useUser } from '@/context/UserContext'

export default function UploadPage() {
  const router = useRouter()
  const { user } = useUser()
  const [file, setFile] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnail(e.target.files[0])
    }
  }

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);

      // Validar el tamaño del archivo (por ejemplo, máximo 100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB en bytes
      if (file.size > maxSize) {
        throw new Error('El archivo es demasiado grande. El tamaño máximo es 100MB.');
      }

      const filePath = await uploadFile(file, 'videos');
      const { data: url } = supabase.storage.from('uploads').getPublicUrl(filePath);

      if (!url.publicUrl) {
        throw new Error('Error al obtener la URL del video');
      }

      setVideoUrl(url.publicUrl);
      toast.success('Video subido exitosamente');
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Error en la subida');
      toast.error('Error al subir el video');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user) return

    try {
      setUploading(true)
      setError(null)

      // 1. Obtener metadata del usuario actual
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // 2. Subir el video con los datos del usuario
      const videoFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()}`
      const thumbnailFileName = thumbnail 
        ? `${Date.now()}-${thumbnail.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()}`
        : null

      // 3. Validar el tipo de archivo
      if (!file.type.startsWith('video/')) {
        throw new Error('El archivo debe ser un video')
      }

      // 4. Subir el video
      const { error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, file)

      if (videoError) {
        throw new Error(`Error al subir el video: ${videoError.message}`)
      }

      // 5. Subir la miniatura si existe
      let thumbnailPath = null
      if (thumbnail) {
        const { error: thumbnailError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailFileName!, thumbnail)

        if (thumbnailError) {
          throw new Error(`Error al subir la miniatura: ${thumbnailError.message}`)
        }
        thumbnailPath = thumbnailFileName
      }

      // 6. Crear el registro en la base de datos con los datos del usuario
      const { error: dbError } = await supabase
        .from('videos')
        .insert({
          title,
          description,
          video_path: videoFileName,
          thumbnail_path: thumbnailPath,
          user_id: user.id,
          user_avatar: userData?.avatar_url || user.user_metadata?.avatar_url,
          user_name: userData?.full_name || user.user_metadata?.full_name
        })

      if (dbError) {
        throw new Error(`Error al guardar en la base de datos: ${dbError.message}`)
      }

      // 7. Redirigir a la página principal
      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error('Error en la subida:', err)
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-white">Debes iniciar sesión para subir videos</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl p-4 mx-auto">
      <h1 className="mb-4 text-2xl font-bold">Subir Video</h1>
      
      {error && (
        <div className="px-4 py-3 mb-4 text-red-700 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Video
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            disabled={uploading}
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Miniatura 
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleThumbnailChange}
            className="w-full p-2 border rounded"
            disabled={uploading}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Título
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={uploading}
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded"
            rows={4}
            disabled={uploading}
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !file}
          className={`w-full py-2 px-4 rounded font-medium ${
            uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {uploading ? 'Subiendo...' : 'Subir Video'}
        </button>
      </form>
    </div>
  )
}
