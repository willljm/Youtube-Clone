import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { WatchVideoSkeleton } from '@/components/Skeleton'
import FilterSlider from '@/components/FilterSlider'

const inter = Inter({ subsets: ['latin'] })

interface WatchLayoutProps {
  children: React.ReactNode
}

export default function WatchLayout({ children }: WatchLayoutProps) {
  return (
    <main className="min-h-screen bg-[#0f0f0f]">
      <Suspense fallback={<WatchVideoSkeleton />}>
        {children}
      </Suspense>
    </main>
  )
}
