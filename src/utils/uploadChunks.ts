const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks

export async function uploadInChunks(
  file: File,
  supabase: any,
  filePath: string,
  onProgress: (progress: number) => void
) {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const fileId = Math.random().toString(36).substring(2)
  
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(file.size, start + CHUNK_SIZE)
    const chunk = file.slice(start, end)
    const chunkNumber = i + 1
    
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('chunkNumber', chunkNumber.toString())
    formData.append('totalChunks', totalChunks.toString())
    formData.append('fileId', fileId)
    formData.append('fileName', filePath)

    try {
      const { error } = await supabase.storage
        .from('videos')
        .upload(`${filePath}_chunk_${chunkNumber}`, chunk, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        throw error
      }

      // Actualizar el progreso
      const progress = (chunkNumber / totalChunks) * 100
      onProgress(progress)

    } catch (error) {
      console.error(`Error al subir el chunk ${chunkNumber}:`, error)
      throw error
    }
  }

  // Una vez que todos los chunks están subidos, combinarlos
  try {
    const { error } = await supabase.functions.invoke('combine-chunks', {
      body: {
        fileId,
        fileName: filePath,
        totalChunks
      }
    })

    if (error) {
      throw error
    }

    // Eliminar los chunks
    for (let i = 1; i <= totalChunks; i++) {
      await supabase.storage
        .from('videos')
        .remove([`${filePath}_chunk_${i}`])
    }

    return { fileId, filePath }
  } catch (error) {
    console.error('Error al combinar los chunks:', error)
    throw error
  }
}
