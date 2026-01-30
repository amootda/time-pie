import { supabase } from '../client'
import type { Event, EventInsert, EventUpdate } from '../types'

export async function getEventsByDate(
  userId: string,
  date: Date
): Promise<Event[]> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', startOfDay.toISOString())
    .lte('start_at', endOfDay.toISOString())
    .order('start_at', { ascending: true })

  if (error) throw error
  return data as Event[]
}

export async function getEventsByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', userId)
    .gte('start_at', startDate.toISOString())
    .lte('end_at', endDate.toISOString())
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
