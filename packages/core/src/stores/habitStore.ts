import { create } from 'zustand'
import type { Habit, HabitLog } from '@time-pie/supabase'
import { toDateString } from '../utils/date'

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
        // 토글: 이미 있으면 삭제 (미완료)
        return {
          logs: state.logs.filter(
            (l) => !(l.habit_id === habitId && l.date === date)
          ),
        }
      }
      // 없으면 생성 (완료)
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
    const today = toDateString()

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
          const dateStr = toDateString(currentDate)
          const log = habitLogs.find((l) => l.date === dateStr)

          if (log) {
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
          todayCompleted: todayLog !== undefined,
        }
      })
  },

  getTodayProgress: () => {
    const habitsWithStreak = get().getHabitsWithStreak()
    const completed = habitsWithStreak.filter((h) => h.todayCompleted).length
    return { completed, total: habitsWithStreak.length }
  },
}))
