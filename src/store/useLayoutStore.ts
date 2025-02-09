import { create } from 'zustand'

interface LayoutStore {
  isSidebarExpanded: boolean
  toggleSidebar: () => void
}

export const useLayoutStore = create<LayoutStore>((set) => ({
  isSidebarExpanded: true,
  toggleSidebar: () => set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
}))
