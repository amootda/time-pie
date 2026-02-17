import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getSuggestions,
  markSuggestionRead as markSuggestionReadApi,
  type AISuggestion,
} from '@time-pie/supabase'

// Query Keys
export const suggestionKeys = {
  all: ['suggestions'] as const,
  byUser: (userId: string) => [...suggestionKeys.all, 'user', userId] as const,
}

/**
 * 사용자의 AI 제안 조회
 */
export function useSuggestionsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: suggestionKeys.byUser(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return getSuggestions(userId)
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10분 (제안은 자주 바뀌지 않음)
  })
}

/**
 * 제안을 읽음으로 표시
 */
export function useMarkSuggestionReadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await markSuggestionReadApi(id)
    },
    onSuccess: () => {
      // 모든 제안 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: suggestionKeys.all })
    },
  })
}
