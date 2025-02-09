'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        setError(error.message)
      }
    } catch (error) {
      setError('Ocurrió un error al intentar iniciar sesión')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="bg-[#282828] p-8 rounded-lg max-w-md w-full">
        <div className="mb-8 text-center">
          <Image
            src="/yutu.svg"
            alt="Yutu"
            width={30}
            height={20}
            className="mx-auto mb-4 dark:invert"
          />
          <h1 className="mb-2 text-2xl font-bold text-white">Iniciar sesión</h1>
          <p className="text-zinc-400">
            para continuar en YouTube Clone
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 text-red-500 border border-red-500 rounded-lg bg-red-500/10">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center w-full gap-3 px-4 py-3 text-black bg-white rounded-lg hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Image
            src="/google.svg"
            alt="Google"
            width={20}
            height={20}
          />
          <span className="font-medium">Continuar con Google</span>
        </button>

        <div className="mt-8 text-sm text-zinc-500">
          <p>
            Al continuar, aceptas los{' '}
            <a href="#" className="text-blue-500 hover:text-blue-400">
              Términos de servicio
            </a>{' '}
            y la{' '}
            <a href="#" className="text-blue-500 hover:text-blue-400">
              Política de privacidad
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
