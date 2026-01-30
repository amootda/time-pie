import { create } from 'zustand'

type ViewMode = 'pie' | 'list'
type Theme = 'light' | 'dark' | 'system'

interface UIState {
  viewMode: ViewMode
  theme: Theme
  isSidebarOpen: boolean
  isModalOpen: boolean
  modalContent: React.ReactNode | null

  // Actions
  setViewMode: (mode: ViewMode) => void
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  openModal: (content: React.ReactNode) => void
  closeModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: 'pie',
  theme: 'light',
  isSidebarOpen: false,
  isModalOpen: false,
  modalContent: null,

  setViewMode: (mode) => set({ viewMode: mode }),

  setTheme: (theme) => set({ theme }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  openModal: (content) => set({ isModalOpen: true, modalContent: content }),

  closeModal: () => set({ isModalOpen: false, modalContent: null }),
}))
