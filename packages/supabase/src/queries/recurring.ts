import { supabase } from '../client'
import type { RecurringRule, RecurringRuleInsert } from '../types'

export async function getRecurringRulesForEvent(
  eventId: string
): Promise<RecurringRule[]> {
  const { data, error } = await supabase
    .from('recurring_rules')
    .select('*')
    .eq('event_id', eventId)

  if (error) throw error
  return data as RecurringRule[]
}

export async function createRecurringRule(
  rule: RecurringRuleInsert
): Promise<RecurringRule> {
  const { data, error } = await supabase
    .from('recurring_rules')
    .insert(rule)
    .select()
    .single()

  if (error) throw error
  return data as RecurringRule
}

export async function deleteRecurringRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('recurring_rules')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function deleteRecurringRulesForEvent(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('recurring_rules')
    .delete()
    .eq('event_id', eventId)

  if (error) throw error
}
