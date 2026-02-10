import { create } from 'zustand'
import type { Todo } from '@time-pie/supabase'
import { toDateString } from '../utils/date'

type FilterType = 'all' | 'today' | 'completed' | 'pending'

interface TodoState {
  todos: Todo[]
  filter: FilterType
  isLoading: boolean
  error: string | null

  // Actions
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleComplete: (id: string) => void
  setFilter: (filter: FilterType) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed
  filteredTodos: () => Todo[]
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  filter: 'all',
  isLoading: false,
  error: null,

  setTodos: (todos) => set({ todos }),

  addTodo: (todo) =>
    set((state) => ({
      todos: [...state.todos, todo],
    })),

  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    })),

  toggleComplete: (id) =>
    set((state) => ({
      todos: state.todos.map((t) =>
        t.id === id
          ? {
              ...t,
              is_completed: !t.is_completed,
              completed_at: !t.is_completed
                ? new Date().toISOString()
                : null,
            }
          : t
      ),
    })),

  setFilter: (filter) => set({ filter }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  filteredTodos: () => {
    const { todos, filter } = get()
    const today = toDateString()

    switch (filter) {
      case 'today':
        return todos.filter((t) => t.due_date === today)
      case 'completed':
        return todos.filter((t) => t.is_completed)
      case 'pending':
        return todos.filter((t) => !t.is_completed)
      default:
        return todos
    }
  },
}))
