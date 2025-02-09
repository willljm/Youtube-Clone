'use client'

import { LayoutProvider } from '@/stores/layoutStore'
import { VideoProvider } from '@/context/VideoContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <VideoProvider>
        {children}
      </VideoProvider>
    </LayoutProvider>
  )
}
