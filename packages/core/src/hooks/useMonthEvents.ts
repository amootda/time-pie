import { useQuery } from '@tanstack/react-query'
import type { EventMonthMeta } from '@time-pie/supabase'

interface MonthEventsResponse {
  events: EventMonthMeta[]
  month: number
  year: number
  count: number
}

/**
 * 특정 월의 이벤트를 조회하는 React Query hook
 *
 * @param year - 연도 (예: 2026)
 * @param month - 월 (1-12)
 * @returns TanStack Query result with events data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMonthEvents(2026, 2)
 * ```
 */
export function useMonthEvents(year: number, month: number) {
  return useQuery({
    queryKey: ['events', 'month', year, month],
    queryFn: async (): Promise<MonthEventsResponse> => {
      const response = await fetch(`/api/events/month?year=${year}&month=${month}`)

      if (!response.ok) {
        throw new Error('Failed to fetch month events')
      }

      return response.json()
    },
    // 5분간 캐시 유지
    staleTime: 5 * 60 * 1000,
    // 에러 시 재시도 안 함 (이미 전역 설정에서 1회 재시도함)
    retry: false,
  })
}
