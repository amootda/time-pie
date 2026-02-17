import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTodos,
  createTodo as createTodoApi,
  updateTodo as updateTodoApi,
  deleteTodo as deleteTodoApi,
  toggleTodoComplete as toggleTodoCompleteApi,
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
      // 모든 할 일 쿼리 무효화
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
      // 모든 할 일 쿼리 무효화
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
      // 모든 할 일 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}

/**
 * 할 일 완료/미완료 토글
 */
export function useToggleTodoMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return toggleTodoCompleteApi(id)
    },
    onSuccess: () => {
      // 모든 할 일 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: todoKeys.all })
    },
  })
}
