import { supabase } from '../client'
import type { WeeklyReport, WeeklyReportInsert } from '../types'

export async function getWeeklyReports(
  userId: string
): Promise<WeeklyReport[]> {
  const { data, error } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })

  if (error) throw error
  return data as WeeklyReport[]
}

export async function getLatestWeeklyReport(
  userId: string
): Promise<WeeklyReport | null> {
  const { data, error } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('user_id', userId)
    .order('week_start', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as WeeklyReport
}

export async function createWeeklyReport(
  report: WeeklyReportInsert
): Promise<WeeklyReport> {
  const { data, error } = await supabase
    .from('weekly_reports')
    .upsert(report, { onConflict: 'user_id,week_start' })
    .select()
    .single()

  if (error) throw error
  return data as WeeklyReport
}
