import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Solo redirigir a /auth si no hay sesión y está intentando acceder a /studio
  if (!session && req.nextUrl.pathname.startsWith('/studio')) {
  }

  return res
}

export const config = {
  matcher: ['/studio/:path*']
}
