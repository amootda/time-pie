import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getEventsByDate,
  createEvent as createEventApi,
  updateEvent as updateEventApi,
  deleteEvent as deleteEventApi,
  type Event,
  type EventInsert,
} from '@time-pie/supabase'
import { toDateString } from '../../utils/date'

// Query Keys
export const eventKeys = {
  all: ['events'] as const,
  byDate: (date: Date) => [...eventKeys.all, 'date', toDateString(date)] as const,
}

/**
 * 특정 날짜의 이벤트 조회
 */
export function useEventsQuery(userId: string | undefined, date: Date) {
  return useQuery({
    queryKey: eventKeys.byDate(date),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return getEventsByDate(userId, date)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

/**
 * 이벤트 생성
 */
export function useCreateEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: EventInsert) => {
      return createEventApi(event)
    },
    onSuccess: () => {
      // 모든 이벤트 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

/**
 * 이벤트 수정
 */
export function useUpdateEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Event> }) => {
      return updateEventApi(id, updates)
    },
    onSuccess: () => {
      // 모든 이벤트 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}

/**
 * 이벤트 삭제
 */
export function useDeleteEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteEventApi(id)
    },
    onSuccess: () => {
      // 모든 이벤트 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: eventKeys.all })
    },
  })
}
