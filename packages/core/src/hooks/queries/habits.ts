import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getHabits,
  getHabitLogs,
  createHabit as createHabitApi,
  updateHabit as updateHabitApi,
  deleteHabit as deleteHabitApi,
  logHabitCompletion as logHabitCompletionApi,
  type Habit,
  type HabitInsert,
  type HabitLog,
} from '@time-pie/supabase'

// Query Keys
export const habitKeys = {
  all: ['habits'] as const,
  byUser: (userId: string) => [...habitKeys.all, 'user', userId] as const,
  logs: ['habit-logs'] as const,
  logsByHabits: (habitIds: string[], startDate: string, endDate: string) =>
    [...habitKeys.logs, habitIds, startDate, endDate] as const,
}

/**
 * 사용자의 모든 습관 조회
 */
export function useHabitsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: habitKeys.byUser(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return getHabits(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

/**
 * 습관 로그 조회
 */
export function useHabitLogsQuery(
  habitIds: string[],
  startDate: string,
  endDate: string,
  enabled = true
) {
  return useQuery({
    queryKey: habitKeys.logsByHabits(habitIds, startDate, endDate),
    queryFn: async () => {
      if (habitIds.length === 0) return []
      return getHabitLogs(habitIds, startDate, endDate)
    },
    enabled: enabled && habitIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

/**
 * 습관 생성
 */
export function useCreateHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (habit: HabitInsert) => {
      return createHabitApi(habit)
    },
    onSuccess: () => {
      // 모든 습관 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: habitKeys.all })
    },
  })
}

/**
 * 습관 수정
 */
export function useUpdateHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Habit> }) => {
      return updateHabitApi(id, updates)
    },
    onSuccess: () => {
      // 모든 습관 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: habitKeys.all })
    },
  })
}

/**
 * 습관 삭제
 */
export function useDeleteHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteHabitApi(id)
    },
    onSuccess: () => {
      // 모든 습관 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: habitKeys.all })
    },
  })
}

/**
 * 습관 완료 로그 (낙관적 업데이트 포함)
 */
export function useLogHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      await logHabitCompletionApi(habitId, date)
    },
    onSuccess: () => {
      // 모든 습관 로그 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: habitKeys.logs })
    },
  })
}
