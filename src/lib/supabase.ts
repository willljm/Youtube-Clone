import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)

export const setupStorageBuckets = async () => {
  try {
    console.log('Configuración de buckets iniciada')
    // Verificar que tenemos URL válida antes de continuar
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('URL de Supabase no configurada')
    }

    // Verificar si los buckets ya existen antes de crearlos
    const { data: buckets } = await supabase.storage.listBuckets()
    
    if (!buckets?.find(b => b.name === 'videos')) {
      const { error: videosError } = await supabase.storage.createBucket('videos', {
        public: false,
        allowedMimeTypes: ['video/mp4'],
        fileSizeLimit: 50000000 // 50MB
      })
      if (videosError) {
        console.error('Error al crear bucket videos:', videosError)
      }
    }

    if (!buckets?.find(b => b.name === 'thumbnails')) {
      const { error: thumbnailsError } = await supabase.storage.createBucket('thumbnails', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png'],
        fileSizeLimit: 5000000 // 5MB
      })
      if (thumbnailsError) {
        console.error('Error al crear bucket thumbnails:', thumbnailsError)
      }
    }
  } catch (error) {
    console.error('Error en setupStorageBuckets:', error)
  }
}

// Función para obtener URL firmada de video
export async function getVideoUrl(videoPath: string): Promise<string | null> {
  try {
    if (!videoPath) {
      console.error('Error: videoPath está vacío')
      return null
    }

    console.log('Obteniendo URL firmada para:', videoPath)

    const { data, error } = await supabase
      .storage
      .from('videos')
      .createSignedUrl(videoPath, 3600) // URL válida por 1 hora

    if (error) {
      console.error('Error al obtener URL firmada:', error)
      return null
    }

    if (!data?.signedUrl) {
      console.error('No se obtuvo URL firmada')
      return null
    }

    console.log('URL firmada obtenida correctamente')
    return data.signedUrl
  } catch (error) {
    console.error('Error al obtener URL del video:', error)
    return null
  }
}

// Función para obtener URL de miniatura
export async function getThumbnailUrl(thumbnailPath: string | null): Promise<string | null> {
  try {
    if (!thumbnailPath) {
      console.log('No hay miniatura disponible')
      return null
    }

    console.log('Obteniendo URL pública para miniatura:', thumbnailPath)

    const { data } = await supabase
      .storage
      .from('thumbnails')
      .getPublicUrl(thumbnailPath)

    if (!data?.publicUrl) {
      console.error('No se obtuvo URL pública para la miniatura')
      return null
    }

    console.log('URL de miniatura obtenida correctamente')
    return data.publicUrl
  } catch (error) {
    console.error('Error al obtener URL de la miniatura:', error)
    return null
  }
}

export const testConnection = async () => {
  const { data, error } = await supabase
    .from('videos')
    .select('count')
    .single()
  
  console.log('Test connection result:', { data, error })
  return !error
}
