import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getExecutionsByDate,
  createExecution as createExecutionApi,
  startExecution as startExecutionApi,
  completeExecution as completeExecutionApi,
  skipExecution as skipExecutionApi,
  type EventExecution,
  type EventExecutionInsert,
} from '@time-pie/supabase'
import { toDateString } from '../../utils/date'

// Query Keys
export const executionKeys = {
  all: ['executions'] as const,
  byDate: (date: Date) => [...executionKeys.all, 'date', toDateString(date)] as const,
}

/**
 * 특정 날짜의 실행 기록 조회
 */
export function useExecutionsQuery(userId: string | undefined, date: Date) {
  return useQuery({
    queryKey: executionKeys.byDate(date),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return getExecutionsByDate(userId, date)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

/**
 * 실행 기록 생성
 */
export function useCreateExecutionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (execution: EventExecutionInsert) => {
      return createExecutionApi(execution)
    },
    onSuccess: () => {
      // 모든 실행 기록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: executionKeys.all })
    },
  })
}

/**
 * 실행 시작
 */
export function useStartExecutionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (executionId: string) => {
      return startExecutionApi(executionId)
    },
    onSuccess: () => {
      // 모든 실행 기록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: executionKeys.all })
    },
  })
}

/**
 * 실행 완료
 */
export function useCompleteExecutionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (executionId: string) => {
      return completeExecutionApi(executionId)
    },
    onSuccess: () => {
      // 모든 실행 기록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: executionKeys.all })
    },
  })
}

/**
 * 실행 건너뛰기
 */
export function useSkipExecutionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (executionId: string) => {
      return skipExecutionApi(executionId)
    },
    onSuccess: () => {
      // 모든 실행 기록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: executionKeys.all })
    },
  })
}
