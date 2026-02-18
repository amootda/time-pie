import { supabase } from '../client'
import type { Todo, TodoInsert, TodoUpdate } from '../types'

const TODO_SELECT_FIELDS = 'id, user_id, title, description, due_date, priority, is_completed, completed_at, category_id, created_at, updated_at'

export async function getTodos(userId: string): Promise<Todo[]> {
    const { data, error } = await supabase
        .from('todos')
        .select(TODO_SELECT_FIELDS)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data as Todo[]
}

export async function getTodosByDate(
    userId: string,
    date: string
): Promise<Todo[]> {
    const { data, error } = await supabase
        .from('todos')
        .select(TODO_SELECT_FIELDS)
        .eq('user_id', userId)
        .eq('due_date', date)
        .order('priority', { ascending: true })

    if (error) throw error
    return data as Todo[]
}

export async function createTodo(todo: TodoInsert): Promise<Todo> {
    const { data, error } = await supabase
        .from('todos')
        .insert(todo)
        .select()
        .single()

    if (error) throw error
    return data as Todo
}

export async function updateTodo(
    id: string,
    updates: TodoUpdate
): Promise<Todo> {
    const { data, error } = await supabase
        .from('todos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data as Todo
}

/**
 * Toggle todo completion.
 * Accepts currentIsCompleted from the caller to avoid a SELECT→UPDATE waterfall.
 */
export async function toggleTodoComplete(id: string, currentIsCompleted: boolean): Promise<Todo> {
    const newIsCompleted = !currentIsCompleted
    const now = new Date().toISOString()

    const { data, error } = await supabase
        .from('todos')
        .update({
            is_completed: newIsCompleted,
            completed_at: newIsCompleted ? now : null,
            updated_at: now,
        })
        .eq('id', id)
        .select(TODO_SELECT_FIELDS)
        .single()

    if (error) throw error
    return data as Todo
}

export async function deleteTodo(id: string): Promise<void> {
    const { error } = await supabase.from('todos').delete().eq('id', id)

    if (error) throw error
}
