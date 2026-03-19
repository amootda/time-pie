import { useQuery } from '@tanstack/react-query'
import {
  getWeeklyReports,
  getLatestWeeklyReport,
  type WeeklyReport,
} from '@time-pie/supabase'

export const reportKeys = {
  all: ['reports'] as const,
  byUser: (userId: string) => [...reportKeys.all, 'user', userId] as const,
  latest: (userId: string) => [...reportKeys.all, 'latest', userId] as const,
}

export function useWeeklyReportsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.byUser(userId!),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return getWeeklyReports(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLatestWeeklyReportQuery(userId: string | undefined) {
  return useQuery({
    queryKey: reportKeys.latest(userId!),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return getLatestWeeklyReport(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  })
}
