export interface Video {
  id: string
  title: string
  description?: string
  thumbnail_url: string
  video_url: string
  duration?: string
  views: number
  likes?: number
  created_at: string
  updated_at?: string
  user_id: string
  liked_at?: string
  isNew?: boolean
  profiles?: {
    id: string
    full_name: string | null
    avatar_url: string | null
    email: string | null
  }
}

export interface Channel {
  id: string
  name: string
  avatar_url: string
  subscribers: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  content: string
  video_id: string
  user_id: string
  likes: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  avatar_url: string
  username: string
  created_at: string
  updated_at: string
}
