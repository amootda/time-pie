import dayjs from 'dayjs'
import { supabase } from '../client'
import type { Habit, HabitInsert, HabitUpdate, HabitLog } from '../types'

export async function getHabits(userId: string): Promise<Habit[]> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Habit[]
}

export async function getHabitLogs(
  habitIds: string[],
  startDate: string,
  endDate: string
): Promise<HabitLog[]> {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .in('habit_id', habitIds)
    .gte('date', startDate)
    .lte('date', endDate)

  if (error) throw error
  return data as HabitLog[]
}

export async function createHabit(habit: HabitInsert): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single()

  if (error) throw error
  return data as Habit
}

export async function updateHabit(
  id: string,
  updates: HabitUpdate
): Promise<Habit> {
  const { data, error } = await supabase
    .from('habits')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Habit
}

export async function deleteHabit(id: string): Promise<void> {
  // 소프트 삭제 (is_active = false)
  const { error } = await supabase
    .from('habits')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

export async function logHabitCompletion(
  habitId: string,
  date: string
): Promise<HabitLog> {
  // upsert: 이미 있으면 completed_count 증가, 없으면 생성
  const { data: existing } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .eq('date', date)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('habit_logs')
      .update({ completed_count: existing.completed_count + 1 })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw error
    return data as HabitLog
  }

  const { data, error } = await supabase
    .from('habit_logs')
    .insert({
      habit_id: habitId,
      date,
      completed_count: 1,
    })
    .select()
    .single()

  if (error) throw error
  return data as HabitLog
}

export async function getHabitStreak(habitId: string): Promise<number> {
  const today = new Date()
  const logs: HabitLog[] = []

  // 최근 365일 로그 가져오기
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 365)

  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('habit_id', habitId)
    .gte('date', dayjs(startDate).format('YYYY-MM-DD'))
    .order('date', { ascending: false })

  if (error) throw error

  const habit = await supabase
    .from('habits')
    .select('target_count')
    .eq('id', habitId)
    .single()

  if (habit.error) throw habit.error

  const targetCount = habit.data.target_count

  // 스트릭 계산
  let streak = 0
  const currentDate = new Date(today)

  const logMap = new Map((data as HabitLog[]).map((l) => [l.date, l]))

  for (let i = 0; i < 365; i++) {
    const dateStr = dayjs(currentDate).format('YYYY-MM-DD')
    const log = logMap.get(dateStr)

    if (log && log.completed_count >= targetCount) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (i === 0) {
      // 오늘은 아직 안 해도 스트릭 유지
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}
