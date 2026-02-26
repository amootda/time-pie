import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createHabit as createHabitApi,
    deleteHabit as deleteHabitApi,
    getHabitLogs,
    getHabits,
    logHabitCompletion as logHabitCompletionApi,
    updateHabit as updateHabitApi,
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
 * 습관 완료 로그 (Optimistic Update 포함)
 */
export function useLogHabitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ habitId, date }: { habitId: string; date: string }) => {
      await logHabitCompletionApi(habitId, date)
    },
    onMutate: async ({ habitId, date }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: habitKeys.logs })

      // Snapshot previous logs
      const previousQueries = queryClient.getQueriesData<HabitLog[]>({ queryKey: habitKeys.logs })

      // Optimistically add the log entry
      queryClient.setQueriesData<HabitLog[]>({ queryKey: habitKeys.logs }, (old) => {
        if (!old) return old
        const alreadyLogged = old.some((l) => l.habit_id === habitId && l.date === date)
        if (alreadyLogged) {
          // Toggle off: remove the log
          return old.filter((l) => !(l.habit_id === habitId && l.date === date))
        }
        // Toggle on: add a temporary log
        return [...old, { habit_id: habitId, date, id: `temp-${Date.now()}`, created_at: new Date().toISOString() } as HabitLog]
      })

      return { previousQueries }
    },
    onError: (_err, _vars, context) => {
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.logs })
    },
  })
}
