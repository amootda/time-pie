import dayjs from 'dayjs'
import { supabase } from '../client'
import type { Event, EventInsert, EventUpdate, EventMonthMeta } from '../types'

export async function getEventsByDate(
  userId: string,
  date: Date
): Promise<Event[]> {
  const startOfDay = dayjs(date).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
  const endOfDay = dayjs(date).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ')

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', startOfDay)
    .lte('start_at', endOfDay)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as Event[]
}

export async function getEventsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Event[]> {
  const start = dayjs(startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
  const end = dayjs(endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ')

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', start)
    .lte('end_at', end)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as Event[]
}

/**
 * 특정 월의 이벤트 메타데이터 조회 (캘린더 뷰 최적화)
 * 기존 idx_events_user_date 인덱스 활용
 */
export async function getEventsByMonth(
  userId: string,
  year: number,
  month: number
): Promise<EventMonthMeta[]> {
  // 월의 첫날과 마지막날 계산
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0, 23, 59, 59, 999)

  const start = dayjs(startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
  const end = dayjs(endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ')

  const { data, error } = await supabase
    .from('events')
    .select('id, title, start_at, end_at, event_type, purpose, color')
    .eq('user_id', userId)
    .gte('start_at', start)
    .lte('start_at', end)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as EventMonthMeta[]
}

export async function createEvent(event: EventInsert): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function updateEvent(
  id: string,
  updates: EventUpdate
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Event
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)

  if (error) throw error
}
