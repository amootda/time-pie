// 수동 타입 정의 (Supabase 연결 후 자동 생성으로 대체 가능)

export type EventType = 'anchor' | 'task'
export type EventPurpose = 'work' | 'appointment' | 'exercise' | 'study' | 'other'
export type ExecutionStatus = 'planned' | 'in_progress' | 'completed' | 'skipped' | 'partial'
export type SuggestionType = 'time_adjustment' | 'unrealistic_warning' | 'pattern_insight'

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
  event_type: EventType
  color: string
  purpose: string | null
  category_id: string | null
  reminder_min: number | null
  // Anchor-specific
  base_time: string | null
  target_duration_min: number | null
  buffer_min: number | null
  // Shared
  repeat_days: number[] | null
  created_at: string
  updated_at: string
}

// 캘린더 월간 뷰용 최적화된 메타데이터 타입
export type EventMonthMeta = Pick<Event,
  'id' | 'title' | 'start_at' | 'end_at' | 'event_type' | 'purpose' | 'color' | 'repeat_days'
>

export interface RecurringRule {
  id: string
  event_id: string
  frequency: 'daily' | 'weekly' | 'monthly'
  days_of_week: number[] | null
  interval: number
  end_date: string | null
  created_at: string
}

export interface EventExecution {
  id: string
  event_id: string
  user_id: string
  planned_start: string
  planned_end: string
  actual_start: string | null
  actual_end: string | null
  status: ExecutionStatus
  completion_rate: number
  date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AISuggestion {
  id: string
  user_id: string
  event_id: string | null
  suggestion_type: SuggestionType
  title: string
  description: string
  suggested_data: Record<string, unknown> | null
  is_read: boolean
  is_applied: boolean
  created_at: string
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

export type RecurringRuleInsert = Omit<RecurringRule, 'id' | 'created_at'>

export type EventExecutionInsert = Omit<EventExecution, 'id' | 'created_at' | 'updated_at'>
export type EventExecutionUpdate = Partial<Omit<EventExecution, 'id' | 'user_id' | 'created_at'>>

export type AISuggestionInsert = Omit<AISuggestion, 'id' | 'created_at'>

export type TodoInsert = Omit<Todo, 'id' | 'created_at' | 'updated_at'>
export type TodoUpdate = Partial<Omit<Todo, 'id' | 'user_id' | 'created_at'>>

export type HabitInsert = Omit<Habit, 'id' | 'created_at' | 'updated_at'>
export type HabitUpdate = Partial<Omit<Habit, 'id' | 'user_id' | 'created_at'>>
