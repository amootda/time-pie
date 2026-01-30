import { create } from 'zustand'
import type { Event } from '@time-pie/supabase'

interface EventState {
  events: Event[]
  selectedDate: Date
  isLoading: boolean
  error: string | null

  // Actions
  setSelectedDate: (date: Date) => void
  setEvents: (events: Event[]) => void
  addEvent: (event: Event) => void
  updateEvent: (id: string, updates: Partial<Event>) => void
  deleteEvent: (id: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  selectedDate: new Date(),
  isLoading: false,
  error: null,

  setSelectedDate: (date) => set({ selectedDate: date }),

  setEvents: (events) => set({ events }),

  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
}))
