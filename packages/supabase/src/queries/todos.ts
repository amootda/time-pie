import { supabase } from '../client'
import type { Todo, TodoInsert, TodoUpdate } from '../types'

export async function getTodos(userId: string): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
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
    .select('*')
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

export async function toggleTodoComplete(id: string): Promise<Todo> {
  // 먼저 현재 상태를 가져옴
  const { data: current, error: fetchError } = await supabase
    .from('todos')
    .select('is_completed')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const isCompleted = !current.is_completed

  const { data, error } = await supabase
    .from('todos')
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Todo
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', id)

  if (error) throw error
}
