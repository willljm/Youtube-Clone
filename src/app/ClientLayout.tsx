'use client'

import Header from "@/components/Header"
import { UserProvider } from '@/context/UserContext'
import { VideoProvider } from '@/context/VideoContext'
import { Toaster } from 'sonner'
import TopLoader from '@/components/TopLoader'
import MobileNav from "@/components/MobileNav"

interface ClientLayoutProps {
  children: React.ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <UserProvider>
      <VideoProvider>
        <TopLoader />
        <Toaster richColors position="top-center" />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="pt-14">
            {children}
          </main>
          <MobileNav />
        </div>
      </VideoProvider>
    </UserProvider>
  )
}
