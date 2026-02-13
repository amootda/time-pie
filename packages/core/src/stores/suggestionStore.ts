import { create } from 'zustand'
import type { AISuggestion } from '@time-pie/supabase'

interface SuggestionState {
  suggestions: AISuggestion[]
  isLoading: boolean
  error: string | null

  // Actions
  setSuggestions: (suggestions: AISuggestion[]) => void
  addSuggestion: (suggestion: AISuggestion) => void
  markRead: (id: string) => void
  markApplied: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed
  getUnreadCount: () => number
  getTopSuggestion: () => AISuggestion | null
}

export const useSuggestionStore = create<SuggestionState>((set, get) => ({
  suggestions: [],
  isLoading: false,
  error: null,

  setSuggestions: (suggestions) => set({ suggestions }),

  addSuggestion: (suggestion) =>
    set((state) => ({
      suggestions: [suggestion, ...state.suggestions],
    })),

  markRead: (id) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, is_read: true } : s
      ),
    })),

  markApplied: (id) =>
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, is_applied: true, is_read: true } : s
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  getUnreadCount: () => {
    return get().suggestions.filter((s) => !s.is_read).length
  },

  getTopSuggestion: () => {
    return get().suggestions.find((s) => !s.is_read) || null
  },
}))
