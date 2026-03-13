import { useCallback } from 'react'
import { useTodoStore } from '../stores/todoStore'
import {
    getTodos,
    createTodo as createTodoApi,
    updateTodo as updateTodoApi,
    deleteTodo as deleteTodoApi,
    toggleTodoComplete as toggleTodoApi,
    type Todo,
    type TodoInsert,
} from '@time-pie/supabase'

export interface UseTodoDataReturn {
    isLoading: boolean
    createTodo: (todo: Omit<TodoInsert, 'user_id'>) => Promise<Todo>
    updateTodo: (id: string, updates: Partial<Todo>) => Promise<Todo>
    removeTodo: (id: string) => Promise<void>
    toggleTodoComplete: (id: string) => Promise<Todo>
    loadTodos: (userId: string) => Promise<Todo[]>
}

export function useTodoData(userId: string | undefined): UseTodoDataReturn {
    const setTodos = useTodoStore((s) => s.setTodos)
    const addTodo = useTodoStore((s) => s.addTodo)
    const updateTodoStore = useTodoStore((s) => s.updateTodo)
    const deleteTodoStore = useTodoStore((s) => s.deleteTodo)
    const setLoading = useTodoStore((s) => s.setLoading)
    const setError = useTodoStore((s) => s.setError)
    const isLoading = useTodoStore((s) => s.isLoading)

    const loadTodos = useCallback(
        async (uid: string): Promise<Todo[]> => {
            setLoading(true)
            try {
                const todos = await getTodos(uid)
                setTodos(todos)
                return todos
            } catch (error) {
                console.error('Failed to load todos:', error)
                setError('Failed to load todos')
                return []
            } finally {
                setLoading(false)
            }
        },
        [setTodos, setLoading, setError]
    )

    const createTodo = useCallback(
        async (todo: Omit<TodoInsert, 'user_id'>): Promise<Todo> => {
            if (!userId) throw new Error('User not authenticated')
            const newTodo = await createTodoApi({ ...todo, user_id: userId })
            addTodo(newTodo)
            return newTodo
        },
        [userId, addTodo]
    )

    const updateTodo = useCallback(
        async (id: string, updates: Partial<Todo>): Promise<Todo> => {
            const updated = await updateTodoApi(id, updates, userId)
            updateTodoStore(id, updated)
            return updated
        },
        [userId, updateTodoStore]
    )

    const removeTodo = useCallback(
        async (id: string): Promise<void> => {
            await deleteTodoApi(id, userId)
            deleteTodoStore(id)
        },
        [userId, deleteTodoStore]
    )

    const toggleTodoComplete = useCallback(
        async (id: string): Promise<Todo> => {
            const updated = await toggleTodoApi(id, userId)
            updateTodoStore(id, updated)
            return updated
        },
        [userId, updateTodoStore]
    )

    return { isLoading, createTodo, updateTodo, removeTodo, toggleTodoComplete, loadTodos }
}
