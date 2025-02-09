import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatViewCount(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return views.toString()
}

export function formatTimeAgo(date: string): string {
  const secondsAgo = Math.floor((Date.now() - new Date(date).getTime()) / 1000)

  if (secondsAgo < 60) {
    return 'hace un momento'
  }

  const minutesAgo = Math.floor(secondsAgo / 60)
  if (minutesAgo < 60) {
    return `hace ${minutesAgo} ${minutesAgo === 1 ? 'minuto' : 'minutos'}`
  }

  const hoursAgo = Math.floor(minutesAgo / 60)
  if (hoursAgo < 24) {
    return `hace ${hoursAgo} ${hoursAgo === 1 ? 'hora' : 'horas'}`
  }

  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo < 30) {
    return `hace ${daysAgo} ${daysAgo === 1 ? 'día' : 'días'}`
  }

  const monthsAgo = Math.floor(daysAgo / 30)
  if (monthsAgo < 12) {
    return `hace ${monthsAgo} ${monthsAgo === 1 ? 'mes' : 'meses'}`
  }

  const yearsAgo = Math.floor(monthsAgo / 12)
  return `hace ${yearsAgo} ${yearsAgo === 1 ? 'año' : 'años'}`
}

/**
 * Extrae el path del archivo de una URL de Supabase Storage
 */
export function extractPathFromUrl(url: string): string {
  if (!url) return ''
  
  try {
    // Las URLs de Supabase Storage tienen este formato:
    // https://xxx.supabase.co/storage/v1/object/public/bucket-name/filename
    // o
    // https://xxx.supabase.co/storage/v1/object/sign/bucket-name/filename?token=xxx
    const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/(?:videos|thumbnails)\/([^?]+)/)
    if (match && match[1]) {
      return decodeURIComponent(match[1])
    }
    return ''
  } catch (error) {
    console.error('Error al extraer path de URL:', error)
    return ''
  }
}
