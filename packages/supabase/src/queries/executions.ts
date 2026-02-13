import dayjs from 'dayjs'
import { supabase } from '../client'
import type { EventExecution, EventExecutionInsert, EventExecutionUpdate } from '../types'

export async function getExecutionsByDate(
  userId: string,
  date: Date
): Promise<EventExecution[]> {
  const dateStr = dayjs(date).format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('event_executions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .order('planned_start', { ascending: true })

  if (error) throw error
  return data as EventExecution[]
}

export async function getExecutionsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<EventExecution[]> {
  const startStr = dayjs(startDate).format('YYYY-MM-DD')
  const endStr = dayjs(endDate).format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('event_executions')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startStr)
    .lte('date', endStr)
    .order('date', { ascending: true })

  if (error) throw error
  return data as EventExecution[]
}

export async function getExecutionsByEvent(
  eventId: string,
  startDate: Date,
  endDate: Date
): Promise<EventExecution[]> {
  const startStr = dayjs(startDate).format('YYYY-MM-DD')
  const endStr = dayjs(endDate).format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('event_executions')
    .select('*')
    .eq('event_id', eventId)
    .gte('date', startStr)
    .lte('date', endStr)
    .order('date', { ascending: true })

  if (error) throw error
  return data as EventExecution[]
}

export async function createExecution(
  execution: EventExecutionInsert
): Promise<EventExecution> {
  const { data, error } = await supabase
    .from('event_executions')
    .insert(execution)
    .select()
    .single()

  if (error) throw error
  return data as EventExecution
}

export async function startExecution(id: string): Promise<EventExecution> {
  const { data, error } = await supabase
    .from('event_executions')
    .update({
      actual_start: new Date().toISOString(),
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as EventExecution
}

export async function completeExecution(id: string): Promise<EventExecution> {
  const now = new Date().toISOString()

  // First get the execution to calculate completion rate
  const { data: existing, error: fetchError } = await supabase
    .from('event_executions')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const exec = existing as EventExecution
  let completionRate = 100

  if (exec.actual_start) {
    const plannedDuration =
      new Date(exec.planned_end).getTime() - new Date(exec.planned_start).getTime()
    const actualDuration =
      new Date(now).getTime() - new Date(exec.actual_start).getTime()

    if (plannedDuration > 0) {
      completionRate = Math.min(100, Math.round((actualDuration / plannedDuration) * 100))
    }
  }

  const { data, error } = await supabase
    .from('event_executions')
    .update({
      actual_end: now,
      status: 'completed',
      completion_rate: completionRate,
      updated_at: now,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as EventExecution
}

export async function skipExecution(id: string): Promise<EventExecution> {
  const { data, error } = await supabase
    .from('event_executions')
    .update({
      status: 'skipped',
      completion_rate: 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as EventExecution
}

export async function updateExecution(
  id: string,
  updates: EventExecutionUpdate
): Promise<EventExecution> {
  const { data, error } = await supabase
    .from('event_executions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as EventExecution
}
