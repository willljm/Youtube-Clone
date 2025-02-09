import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import { Providers } from '@/components/Providers'
import { Toaster } from 'sonner'
import Header from '@/components/Header'
import MobileNav from '@/components/MobileNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Youtube Clone',
  description: 'A YouTube clone built with Next.js and Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-[#0f0f0f] text-white antialiased overflow-x-hidden`}>
        <Providers>
          <Header />
          <div className="flex h-[calc(100vh-3.5rem)] mt-14 mb-16 md:mb-0">
            <Sidebar />
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
          </div>
          <MobileNav />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
