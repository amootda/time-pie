// 수동 타입 정의 (Supabase 연결 후 자동 생성으로 대체 가능)

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Event {
  id: string
  user_id: string
  title: string
  description: string | null
  start_at: string
  end_at: string
  is_all_day: boolean
  color: string
  category_id: string | null
  reminder_min: number | null
  created_at: string
  updated_at: string
}

export interface Todo {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: 'high' | 'medium' | 'low'
  is_completed: boolean
  completed_at: string | null
  category_id: string | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  title: string
  description: string | null
  frequency: 'daily' | 'weekly' | 'custom'
  frequency_config: Record<string, unknown>
  target_count: number
  color: string
  reminder_time: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  date: string
  completed_count: number
  created_at: string
}

// Insert/Update 타입
export type EventInsert = Omit<Event, 'id' | 'created_at' | 'updated_at'>
export type EventUpdate = Partial<Omit<Event, 'id' | 'user_id' | 'created_at'>>

export type TodoInsert = Omit<Todo, 'id' | 'created_at' | 'updated_at'>
export type TodoUpdate = Partial<Omit<Todo, 'id' | 'user_id' | 'created_at'>>

export type HabitInsert = Omit<Habit, 'id' | 'created_at' | 'updated_at'>
export type HabitUpdate = Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>
