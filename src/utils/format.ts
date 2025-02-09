export function formatViewCount(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M vistas`
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K vistas`
  } else {
    return `${views} vistas`
  }
}

export function formatDuration(duration: string): string {
  // Formato esperado: "HH:MM:SS" o "MM:SS"
  const parts = duration.split(':')
  if (parts.length === 3) {
    return `${parseInt(parts[0])}:${parts[1]}:${parts[2]}`
  } else if (parts.length === 2) {
    return `${parts[0]}:${parts[1]}`
  }
  return duration
}

export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInYears > 0) {
    return `hace ${diffInYears} ${diffInYears === 1 ? 'año' : 'años'}`
  } else if (diffInMonths > 0) {
    return `hace ${diffInMonths} ${diffInMonths === 1 ? 'mes' : 'meses'}`
  } else if (diffInDays > 0) {
    return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`
  } else if (diffInHours > 0) {
    return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`
  } else if (diffInMinutes > 0) {
    return `hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`
  } else {
    return 'hace un momento'
  }
}
