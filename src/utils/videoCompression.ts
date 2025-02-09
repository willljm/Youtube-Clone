export async function compressVideo(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Crear un elemento de video temporal
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)
    
    video.onloadedmetadata = () => {
      // Crear un canvas con dimensiones reducidas
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Calcular las nuevas dimensiones manteniendo el aspect ratio
      const MAX_WIDTH = 1280
      const MAX_HEIGHT = 720
      let width = video.videoWidth
      let height = video.videoHeight
      
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width)
        width = MAX_WIDTH
      }
      if (height > MAX_HEIGHT) {
        width = Math.round((width * MAX_HEIGHT) / height)
        height = MAX_HEIGHT
      }
      
      canvas.width = width
      canvas.height = height
      
      // Configurar el MediaRecorder con configuración optimizada
      const stream = canvas.captureStream()
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 2500000 // 2.5 Mbps
      })
      
      const chunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webm'), {
          type: 'video/webm'
        })
        
        // Limpiar recursos
        URL.revokeObjectURL(video.src)
        resolve(compressedFile)
      }
      
      // Procesar el video
      video.onplay = () => {
        const processFrame = () => {
          if (video.paused || video.ended) {
            mediaRecorder.stop()
            return
          }
          ctx?.drawImage(video, 0, 0, width, height)
          requestAnimationFrame(processFrame)
        }
        
        mediaRecorder.start()
        processFrame()
      }
      
      video.play()
    }
    
    video.onerror = () => {
      reject(new Error('Error al procesar el video'))
    }
  })
}
