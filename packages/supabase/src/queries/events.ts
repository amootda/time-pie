import dayjs from 'dayjs'
import { supabase } from '../client'
import type { Event, EventInsert, EventUpdate } from '../types'

export async function getEventsByDate(
  userId: string,
  date: Date
): Promise<Event[]> {
  const dateStr = dayjs(date).format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', `${dateStr}T00:00:00`)
    .lte('start_at', `${dateStr}T23:59:59`)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as Event[]
}

export async function getEventsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Event[]> {
  const startStr = dayjs(startDate).format('YYYY-MM-DD')
  const endStr = dayjs(endDate).format('YYYY-MM-DD')

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', `${startStr}T00:00:00`)
    .lte('end_at', `${endStr}T23:59:59`)
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as Event[]
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
