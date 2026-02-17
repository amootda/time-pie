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
  { key: 'hard',   label: '하드', emoji: '🔒', description: '웬만하면 고정된 일정' },
  { key: 'soft',   label: '소프트', emoji: '☁️', description: '자유롭게 이동 가능한 일정' },
]

const SCHEDULE_TYPE_MAP = new Map(SCHEDULE_TYPES.map(t => [t.key, t]))

export function getScheduleTypeInfo(key: EventType): ScheduleTypeInfo | undefined {
  return SCHEDULE_TYPE_MAP.get(key)
}

// All purposes (kept flat for DB CHECK constraint compatibility)
export const EVENT_PURPOSES: PurposeInfo[] = [
  { key: 'sleep',       label: '수면', emoji: '🌙', color: '#34495E' },
  { key: 'meal',        label: '식사', emoji: '🍽️', color: '#F39C12' },
  { key: 'personal',    label: '개인', emoji: '🏠', color: '#2ECC71' },
  { key: 'work',        label: '업무', emoji: '💼', color: '#4A90D9' },
  { key: 'meeting',     label: '미팅', emoji: '🤝', color: '#9B59B6' },
  { key: 'appointment', label: '약속', emoji: '📅', color: '#E67E22' },
  { key: 'commute',     label: '이동', emoji: '🚗', color: '#95A5A6' },
  { key: 'exercise',    label: '운동', emoji: '🏃', color: '#E74C3C' },
  { key: 'study',       label: '공부', emoji: '📚', color: '#3498DB' },
  { key: 'hobby',       label: '취미', emoji: '🎨', color: '#1ABC9C' },
  { key: 'other',       label: '기타', emoji: '📌', color: '#7F8C8D' },
]

// Purpose grouped by schedule type
export const PURPOSES_BY_TYPE: Record<EventType, EventPurpose[]> = {
  anchor: ['sleep', 'meal', 'personal'],
  hard:   ['work', 'meeting', 'appointment', 'commute'],
  soft:   ['exercise', 'study', 'hobby', 'other'],
}

export function getPurposesByType(type: EventType): PurposeInfo[] {
  const keys = PURPOSES_BY_TYPE[type]
  return EVENT_PURPOSES.filter(p => keys.includes(p.key))
}

const PURPOSE_MAP = new Map(EVENT_PURPOSES.map(p => [p.key, p]))

export function getPurposeInfo(key: EventPurpose | null | undefined): PurposeInfo | undefined {
  if (!key) return undefined
  return PURPOSE_MAP.get(key)
}

// Preferred time windows for soft routines
export interface PreferredWindowInfo {
  key: string
  label: string
  range: string
}

export const PREFERRED_WINDOWS: PreferredWindowInfo[] = [
  { key: 'morning',   label: '오전',  range: '06:00~12:00' },
  { key: 'afternoon', label: '오후',  range: '12:00~18:00' },
  { key: 'evening',   label: '저녁',  range: '18:00~22:00' },
  { key: 'night',     label: '밤',    range: '22:00~06:00' },
]
