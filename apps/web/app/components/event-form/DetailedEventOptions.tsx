'use client'

import type { EventType } from '@time-pie/supabase'
import { EVENT_REMINDER_OPTIONS } from '@time-pie/core'
import { Bell } from 'lucide-react'

// ─── Shared sub-components ────────────────────────────────────────────────────

interface RepeatDaysSelectorProps {
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
}

function RepeatDaysSelector({ repeatDays, setRepeatDays }: RepeatDaysSelectorProps) {
  const toggleRepeatDay = (dayIndex: number) => {
    setRepeatDays(
      repeatDays.includes(dayIndex)
        ? repeatDays.filter((d) => d !== dayIndex)
        : [...repeatDays, dayIndex].sort()
    )
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        반복 요일
      </label>
      <div className="flex gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
          <button
            key={i}
            type="button"
            onClick={() => toggleRepeatDay(i)}
            className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${repeatDays.includes(i)
              ? 'bg-primary text-white'
              : 'border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Reminder selector ─────────────────────────────────────────────────────

// Group labels
const GROUP_LABELS: Record<string, string> = {
  minutes: '분',
  hours: '시간',
  days: '일',
}

interface ReminderSelectorProps {
  reminderMins: number[]
  setReminderMins: (value: number[]) => void
}

function ReminderSelector({ reminderMins, setReminderMins }: ReminderSelectorProps) {
  const toggleOption = (value: number) => {
    if (reminderMins.includes(value)) {
      setReminderMins(reminderMins.filter((v) => v !== value))
    } else {
      setReminderMins([...reminderMins, value].sort((a, b) => a - b))
    }
  }

  const groups = ['minutes', 'hours', 'days'] as const

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1.5">
        <Bell className="w-4 h-4" />
        알림 {reminderMins.length > 0 && <span className="text-xs text-primary">({reminderMins.length}개)</span>}
      </label>
      <div className="space-y-2">
        {groups.map((group) => {
          const options = EVENT_REMINDER_OPTIONS.filter((opt) => opt.group === group)
          return (
            <div key={group} className="flex flex-wrap gap-1.5">
              <span className="text-xs text-gray-400 dark:text-gray-500 w-8 py-1.5 shrink-0">{GROUP_LABELS[group]}</span>
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border ${
                    reminderMins.includes(opt.value)
                      ? 'border-primary bg-primary/10 text-primary dark:text-primary'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface DescriptionFieldProps {
  description: string
  setDescription: (value: string) => void
}

function DescriptionField({ description, setDescription }: DescriptionFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        메모 (선택)
      </label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="메모를 입력하세요"
        rows={2}
        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
      />
    </div>
  )
}

// ─── Type-specific variant components ────────────────────────────────────────

interface AnchorEventOptionsProps {
  description: string
  setDescription: (value: string) => void
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
  bufferMin: number
  setBufferMin: (value: number) => void
  reminderMins: number[]
  setReminderMins: (value: number[]) => void
}

function AnchorEventOptions({
  description, setDescription,
  repeatDays, setRepeatDays,
  bufferMin, setBufferMin,
  reminderMins, setReminderMins,
}: AnchorEventOptionsProps) {
  return (
    <div className="space-y-4 border-t border-gray-200 dark:border-gray-700">
      <RepeatDaysSelector repeatDays={repeatDays} setRepeatDays={setRepeatDays} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          유동 허용 (분)
        </label>
        <input
          type="number"
          value={bufferMin}
          onChange={(e) => setBufferMin(Number(e.target.value))}
          min={0}
          max={120}
          step={5}
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
      <ReminderSelector reminderMins={reminderMins} setReminderMins={setReminderMins} />
      <DescriptionField description={description} setDescription={setDescription} />
    </div>
  )
}

interface TaskEventOptionsProps {
  description: string
  setDescription: (value: string) => void
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
  reminderMins: number[]
  setReminderMins: (value: number[]) => void
}

function TaskEventOptions({
  description, setDescription,
  repeatDays, setRepeatDays,
  reminderMins, setReminderMins,
}: TaskEventOptionsProps) {
  return (
    <div className="space-y-4 dark:border-gray-700">
      <RepeatDaysSelector repeatDays={repeatDays} setRepeatDays={setRepeatDays} />
      <ReminderSelector reminderMins={reminderMins} setReminderMins={setReminderMins} />
      <DescriptionField description={description} setDescription={setDescription} />
    </div>
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface DetailedEventOptionsProps {
  type: EventType
  purpose: string | null
  setPurpose: (value: string | null) => void
  description: string
  setDescription: (value: string) => void
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
  // Anchor
  bufferMin: number
  setBufferMin: (value: number) => void
  // Alarm
  reminderMins: number[]
  setReminderMins: (value: number[]) => void
}

/**
 * Renders type-specific advanced options.
 * anchor: repeat days, buffer, reminder, description
 * task: full purpose selector, repeat days, reminder, description
 */
export function DetailedEventOptions(props: DetailedEventOptionsProps) {
  if (props.type === 'anchor') {
    return (
      <AnchorEventOptions
        description={props.description}
        setDescription={props.setDescription}
        repeatDays={props.repeatDays}
        setRepeatDays={props.setRepeatDays}
        bufferMin={props.bufferMin}
        setBufferMin={props.setBufferMin}
        reminderMins={props.reminderMins}
        setReminderMins={props.setReminderMins}
      />
    )
  }

  return (
    <TaskEventOptions
      description={props.description}
      setDescription={props.setDescription}
      repeatDays={props.repeatDays}
      setRepeatDays={props.setRepeatDays}
      reminderMins={props.reminderMins}
      setReminderMins={props.setReminderMins}
    />
  )
}
