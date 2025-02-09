import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { create } from 'zustand'

interface UserState {
  user: any | null
  setUser: (user: any) => void
  clearUser: () => void
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
}))

export function useUser() {
  const { user, setUser, clearUser } = useUserStore()
  const router = useRouter()

  useEffect(() => {
    // Verificar la sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
      }
    })

    // Suscribirse a cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
        } else {
          clearUser()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, clearUser])

  return {
    user,
    signOut: async () => {
      await supabase.auth.signOut()
      clearUser()
      router.push('/')
    }
  }
}
