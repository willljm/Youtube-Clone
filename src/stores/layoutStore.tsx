'use client'

import { create } from 'zustand'
import { createContext, useContext } from 'react'

interface LayoutState {
  isSidebarExpanded: boolean
  toggleSidebar: () => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isSidebarExpanded: true,
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
}))

const LayoutContext = createContext<LayoutState | null>(null)

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <LayoutContext.Provider value={useLayoutStore.getState()}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}
