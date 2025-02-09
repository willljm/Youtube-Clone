export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  subscribers_count?: number
}

export interface Video {
  id: string
  created_at: string
  title: string
  description: string | null
  url: string
  thumbnail_url: string | null
  user_id: string
  views: number
  likes: number
  dislikes: number
  duration: string
  hashtags: string[] | null
  profiles?: Profile
  profile?: Profile
}
