import { create } from 'zustand'
import type { Habit, HabitLog } from '@time-pie/supabase'

interface HabitWithStreak extends Habit {
  streak: number
  todayCompleted: boolean
}

interface HabitState {
  habits: Habit[]
  logs: HabitLog[]
  isLoading: boolean
  error: string | null

  // Actions
  setHabits: (habits: Habit[]) => void
  setLogs: (logs: HabitLog[]) => void
  addHabit: (habit: Habit) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  logHabit: (habitId: string, date: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed
  getHabitsWithStreak: () => HabitWithStreak[]
  getTodayProgress: () => { completed: number; total: number }
}

export const useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  logs: [],
  isLoading: false,
  error: null,

  setHabits: (habits) => set({ habits }),

  setLogs: (logs) => set({ logs }),

  addHabit: (habit) =>
    set((state) => ({
      habits: [...state.habits, habit],
    })),

  updateHabit: (id, updates) =>
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      ),
    })),

  deleteHabit: (id) =>
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    })),

  logHabit: (habitId, date) =>
    set((state) => {
      const existingLog = state.logs.find(
        (l) => l.habit_id === habitId && l.date === date
      )
      if (existingLog) {
        return {
          logs: state.logs.map((l) =>
            l.habit_id === habitId && l.date === date
              ? { ...l, completed_count: l.completed_count + 1 }
              : l
          ),
        }
      }
      return {
        logs: [
          ...state.logs,
          {
            id: crypto.randomUUID(),
            habit_id: habitId,
            date,
            completed_count: 1,
            created_at: new Date().toISOString(),
          },
        ],
      }
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  getHabitsWithStreak: () => {
    const { habits, logs } = get()
    const today = new Date().toISOString().split('T')[0]

    return habits
      .filter((h) => h.is_active)
      .map((habit) => {
        const habitLogs = logs
          .filter((l) => l.habit_id === habit.id)
          .sort((a, b) => b.date.localeCompare(a.date))

        // 스트릭 계산
        let streak = 0
        const currentDate = new Date()

        for (let i = 0; i < 365; i++) {
          const dateStr = currentDate.toISOString().split('T')[0]
          const log = habitLogs.find((l) => l.date === dateStr)

          if (log && log.completed_count >= habit.target_count) {
            streak++
            currentDate.setDate(currentDate.getDate() - 1)
          } else if (i === 0) {
            // 오늘은 아직 안 해도 스트릭 유지
            currentDate.setDate(currentDate.getDate() - 1)
          } else {
            break
          }
        }

        const todayLog = habitLogs.find((l) => l.date === today)

        return {
          ...habit,
          streak,
          todayCompleted:
            todayLog !== undefined &&
            todayLog.completed_count >= habit.target_count,
        }
      })
  },

  getTodayProgress: () => {
    const habitsWithStreak = get().getHabitsWithStreak()
    const completed = habitsWithStreak.filter((h) => h.todayCompleted).length
    return { completed, total: habitsWithStreak.length }
  },
}))
