import { supabase } from '../client'

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  notifications_events: boolean
  notifications_todos: boolean
  notifications_habits: boolean
  timezone: string
  created_at: string
  updated_at: string
}

export type UserSettingsInsert = Omit<UserSettings, 'id' | 'created_at' | 'updated_at'>
export type UserSettingsUpdate = Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at'>>

const DEFAULT_SETTINGS: Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  theme: 'system',
  notifications_events: true,
  notifications_todos: true,
  notifications_habits: true,
  timezone: 'Asia/Seoul',
}

export async function getUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // If no settings exist yet, return null (will be created on first save)
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Failed to get user settings:', error)
    throw error
  }

  return data
}

export async function upsertUserSettings(
  userId: string,
  settings: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserSettings> {
  // 기존 설정 조회하여 병합 (디폴트값으로 덮어쓰기 방지)
  const existing = await getUserSettings(userId)

  const updates = {
    user_id: userId,
    ...DEFAULT_SETTINGS,
    ...(existing && {
      theme: existing.theme,
      notifications_events: existing.notifications_events,
      notifications_todos: existing.notifications_todos,
      notifications_habits: existing.notifications_habits,
      timezone: existing.timezone,
    }),
    ...settings,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_settings')
    .upsert(updates, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) {
    console.error('Failed to upsert user settings:', error)
    throw error
  }

  return data
}

export async function updateUserSettings(
  userId: string,
  updates: UserSettingsUpdate
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Failed to update user settings:', error)
    throw error
  }

  return data
}
