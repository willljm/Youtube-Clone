const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB chunks

function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-zA-Z0-9-_.]/g, '-') // Reemplazar caracteres especiales por guiones
    .replace(/--+/g, '-') // Eliminar guiones múltiples
    .toLowerCase();
}

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

export async function uploadFile(file: File, path: string): Promise<string> {
  const uniqueId = crypto.randomUUID();
  const extension = file.name.split('.').pop();
  const sanitizedName = sanitizeFileName(file.name);
  const finalFileName = `${uniqueId}-${sanitizedName}`;
  const filePath = `${path}/${finalFileName}`;

  try {
    const { error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    return filePath;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Error al subir el archivo');
  }
}
