import { supabase } from '../client'
import type { AISuggestion, AISuggestionInsert } from '../types'

export async function getSuggestions(
  userId: string,
  unreadOnly: boolean = false
): Promise<AISuggestion[]> {
  let query = supabase
    .from('ai_suggestions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query

  if (error) throw error
  return data as AISuggestion[]
}

export async function createSuggestion(
  suggestion: AISuggestionInsert
): Promise<AISuggestion> {
  const { data, error } = await supabase
    .from('ai_suggestions')
    .insert(suggestion)
    .select()
    .single()

  if (error) throw error
  return data as AISuggestion
}

export async function markSuggestionRead(id: string): Promise<AISuggestion> {
  const { data, error } = await supabase
    .from('ai_suggestions')
    .update({ is_read: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as AISuggestion
}

export async function applySuggestion(id: string): Promise<AISuggestion> {
  const { data, error } = await supabase
    .from('ai_suggestions')
    .update({ is_applied: true, is_read: true })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as AISuggestion
}
