import { create } from 'zustand'
import type { EventExecution } from '@time-pie/supabase'

interface ExecutionState {
  executions: EventExecution[]
  activeExecution: EventExecution | null
  isLoading: boolean
  error: string | null

  // Actions
  setExecutions: (executions: EventExecution[]) => void
  addExecution: (execution: EventExecution) => void
  updateExecution: (id: string, updates: Partial<EventExecution>) => void
  setActiveExecution: (execution: EventExecution | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed helpers
  getExecutionsForDate: (date: string) => EventExecution[]
  getCompletionRate: (eventId: string) => number
}

export const useExecutionStore = create<ExecutionState>((set, get) => ({
  executions: [],
  activeExecution: null,
  isLoading: false,
  error: null,

  setExecutions: (executions) => set({ executions }),

  addExecution: (execution) =>
    set((state) => ({
      executions: [...state.executions, execution],
    })),

  updateExecution: (id, updates) =>
    set((state) => ({
      executions: state.executions.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
      activeExecution:
        state.activeExecution?.id === id
          ? { ...state.activeExecution, ...updates }
          : state.activeExecution,
    })),

  setActiveExecution: (execution) => set({ activeExecution: execution }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  getExecutionsForDate: (date) => {
    return get().executions.filter((e) => e.date === date)
  },

  getCompletionRate: (eventId) => {
    const eventExecutions = get().executions.filter(
      (e) => e.event_id === eventId && e.status === 'completed'
    )
    if (eventExecutions.length === 0) return 0
    const total = eventExecutions.reduce((sum, e) => sum + e.completion_rate, 0)
    return Math.round(total / eventExecutions.length)
  },
}))
