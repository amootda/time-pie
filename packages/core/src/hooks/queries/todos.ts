import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    createTodo as createTodoApi,
    deleteTodo as deleteTodoApi,
    getTodos,
    toggleTodoComplete as toggleTodoCompleteApi,
    updateTodo as updateTodoApi,
    type Todo,
    type TodoInsert,
} from '@time-pie/supabase'

// Query Keys
export const todoKeys = {
  all: ['todos'] as const,
  byUser: (userId: string) => [...todoKeys.all, 'user', userId] as const,
}

/**
 * 사용자의 모든 할 일 조회
 */
export function useTodosQuery(userId: string | undefined) {
  return useQuery({
    queryKey: todoKeys.byUser(userId || ''),
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated')
      return getTodos(userId)
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5분
  })
}

/**
 * 할 일 생성
 */
export function useCreateTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (todo: TodoInsert) => {
      return createTodoApi(todo)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

/**
 * 할 일 수정
 */
export function useUpdateTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Todo> }) => {
      return updateTodoApi(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

/**
 * 할 일 삭제
 */
export function useDeleteTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteTodoApi(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

/**
 * 할 일 완료/미완료 토글 (Optimistic Update)
 * currentIsCompleted를 받아서 waterfall 없이 단일 UPDATE
 */
export function useToggleTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, currentIsCompleted }: { id: string; currentIsCompleted: boolean }) => {
      return toggleTodoCompleteApi(id, currentIsCompleted)
    },
    onMutate: async ({ id, currentIsCompleted }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: todoKeys.all })

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData<Todo[]>({ queryKey: todoKeys.all })

      // Optimistically update all matching queries
      queryClient.setQueriesData<Todo[]>({ queryKey: todoKeys.all }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, is_completed: !currentIsCompleted } : t))
      )

      return { previousQueries }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      context?.previousQueries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data)
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}
