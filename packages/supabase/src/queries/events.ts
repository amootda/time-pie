import dayjs from 'dayjs'
import { supabase } from '../client'
import type { Event, EventInsert, EventUpdate, EventMonthMeta } from '../types'

export async function getEventsByDate(
  userId: string,
  date: Date
): Promise<Event[]> {
  const startOfDay = dayjs(date).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
  const endOfDay = dayjs(date).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ')

  // 1) 해당 날짜에 start_at이 있는 이벤트 (hard 일회성 등)
  const dateEventsPromise = supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', startOfDay)
    .lte('start_at', endOfDay)
    .order('start_at', { ascending: true })

  // 2) anchor/soft/hard 반복 이벤트 (repeat_days가 설정된 것들)
  const recurringEventsPromise = supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .in('event_type', ['anchor', 'soft', 'hard'])
    .not('repeat_days', 'is', null)

  const [dateResult, recurringResult] = await Promise.all([
    dateEventsPromise,
    recurringEventsPromise,
  ])

  if (dateResult.error) throw dateResult.error
  if (recurringResult.error) throw recurringResult.error

  // 중복 제거 후 합치기
  const dateEvents = dateResult.data as Event[]
  const recurringEvents = recurringResult.data as Event[]
  const dateEventIds = new Set(dateEvents.map((e) => e.id))
  const uniqueRecurring = recurringEvents.filter((e) => !dateEventIds.has(e.id))

  return [...dateEvents, ...uniqueRecurring]
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
export async function getEventById(id: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data as Event
}

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

  const selectFields = 'id, title, start_at, end_at, event_type, purpose, color, repeat_days'

  // 1) 해당 월에 start_at이 있는 이벤트
  const monthEventsPromise = supabase
    .from('events')
    .select(selectFields)
    .eq('user_id', userId)
    .gte('start_at', start)
    .lte('start_at', end)
    .order('start_at', { ascending: true })

  // 2) anchor/soft/hard 반복 이벤트 (repeat_days가 설정된 것들)
  const recurringEventsPromise = supabase
    .from('events')
    .select(selectFields)
    .eq('user_id', userId)
    .in('event_type', ['anchor', 'soft', 'hard'])
    .not('repeat_days', 'is', null)

  const [monthResult, recurringResult] = await Promise.all([
    monthEventsPromise,
    recurringEventsPromise,
  ])

  if (monthResult.error) throw monthResult.error
  if (recurringResult.error) throw recurringResult.error

  // 중복 제거 후 합치기
  const monthEvents = monthResult.data as EventMonthMeta[]
  const recurringEvents = recurringResult.data as EventMonthMeta[]
  const monthEventIds = new Set(monthEvents.map((e) => e.id))
  const uniqueRecurring = recurringEvents.filter((e) => !monthEventIds.has(e.id))

  return [...monthEvents, ...uniqueRecurring]
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
