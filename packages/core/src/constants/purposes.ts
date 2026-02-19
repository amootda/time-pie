import type { EventPurpose, EventType } from '@time-pie/supabase'

export interface PurposeInfo {
  key: EventPurpose
  label: string
  emoji: string
  color: string
}

export interface ScheduleTypeInfo {
  key: EventType
  label: string
  emoji: string
  description: string
}

// Schedule type definitions
export const SCHEDULE_TYPES: ScheduleTypeInfo[] = [
  { key: 'anchor', label: '앵커', emoji: '⚓', description: '절대 움직이지 않는 고정 일정' },
  { key: 'task',   label: '할일', emoji: '📋', description: '일반 일정 및 할일' },
]

const SCHEDULE_TYPE_MAP = new Map(SCHEDULE_TYPES.map(t => [t.key, t]))

export function getScheduleTypeInfo(key: EventType): ScheduleTypeInfo | undefined {
  return SCHEDULE_TYPE_MAP.get(key)
}

// Anchor default color (free-text purpose has no predefined color)
export const ANCHOR_DEFAULT_COLOR = '#34495E'

// All purposes (Task type only - 5 presets)
export const EVENT_PURPOSES: PurposeInfo[] = [
  { key: 'work',        label: '업무', emoji: '💼', color: '#4A90D9' },
  { key: 'appointment', label: '약속', emoji: '📅', color: '#E67E22' },
  { key: 'exercise',    label: '운동', emoji: '🏃', color: '#E74C3C' },
  { key: 'study',       label: '공부', emoji: '📚', color: '#3498DB' },
  { key: 'other',       label: '기타', emoji: '📌', color: '#7F8C8D' },
]

// Purpose grouped by schedule type
export const PURPOSES_BY_TYPE: Record<EventType, EventPurpose[]> = {
  anchor: [],
  task:   ['work', 'appointment', 'exercise', 'study', 'other'],
}

export function getPurposesByType(type: EventType): PurposeInfo[] {
  const keys = PURPOSES_BY_TYPE[type]
  return EVENT_PURPOSES.filter(p => keys.includes(p.key))
}

const PURPOSE_MAP = new Map(EVENT_PURPOSES.map(p => [p.key, p]))

export function getPurposeInfo(key: string | null | undefined): PurposeInfo | undefined {
  if (!key) return undefined
  return PURPOSE_MAP.get(key as EventPurpose)
}
