'use client'

import { getPurposesByType } from '@time-pie/core'
import type { EventType } from '@time-pie/supabase'

// ─── Shared sub-components ────────────────────────────────────────────────────

interface PurposeSelectorProps {
  type: EventType
  purpose: string | null
  setPurpose: (value: string | null) => void
}

function PurposeSelector({ type, purpose, setPurpose }: PurposeSelectorProps) {
  const allPurposes = getPurposesByType(type)
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        전체 약속 유형
      </label>
      <div className="grid grid-cols-3 gap-2">
        {allPurposes.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPurpose(p.key)}
            className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-medium transition-all border-2 ${purpose === p.key
              ? 'border-primary bg-primary/10 text-primary dark:text-primary'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}
          >
            <span className="text-lg mb-0.5">{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

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

const REMINDER_OPTIONS: { value: number | null; label: string }[] = [
  { value: null, label: '없음' },
  { value: 0, label: '정시' },
  { value: 5, label: '5분 전' },
  { value: 10, label: '10분 전' },
  { value: 15, label: '15분 전' },
  { value: 30, label: '30분 전' },
  { value: 60, label: '1시간 전' },
]

interface ReminderSelectorProps {
  reminderMin: number | null
  setReminderMin: (value: number | null) => void
}

function ReminderSelector({ reminderMin, setReminderMin }: ReminderSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        🔔 알림
      </label>
      <div className="flex flex-wrap gap-2">
        {REMINDER_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setReminderMin(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${reminderMin === opt.value
              ? 'border-primary bg-primary/10 text-primary dark:text-primary'
              : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
              }`}
          >
            {opt.label}
          </button>
        ))}
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
  reminderMin: number | null
  setReminderMin: (value: number | null) => void
}

function AnchorEventOptions({
  description, setDescription,
  repeatDays, setRepeatDays,
  bufferMin, setBufferMin,
  reminderMin, setReminderMin,
}: AnchorEventOptionsProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
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
      <ReminderSelector reminderMin={reminderMin} setReminderMin={setReminderMin} />
      <DescriptionField description={description} setDescription={setDescription} />
    </div>
  )
}

interface TaskEventOptionsProps {
  purpose: string | null
  setPurpose: (value: string | null) => void
  description: string
  setDescription: (value: string) => void
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
  reminderMin: number | null
  setReminderMin: (value: number | null) => void
}

function TaskEventOptions({
  purpose, setPurpose,
  description, setDescription,
  repeatDays, setRepeatDays,
  reminderMin, setReminderMin,
}: TaskEventOptionsProps) {
  return (
    <div className="space-y-4 pt-4 dark:border-gray-700">
      <RepeatDaysSelector repeatDays={repeatDays} setRepeatDays={setRepeatDays} />
      <ReminderSelector reminderMin={reminderMin} setReminderMin={setReminderMin} />
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
  reminderMin: number | null
  setReminderMin: (value: number | null) => void
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
        reminderMin={props.reminderMin}
        setReminderMin={props.setReminderMin}
      />
    )
  }

  return (
    <TaskEventOptions
      purpose={props.purpose}
      setPurpose={props.setPurpose}
      description={props.description}
      setDescription={props.setDescription}
      repeatDays={props.repeatDays}
      setRepeatDays={props.setRepeatDays}
      reminderMin={props.reminderMin}
      setReminderMin={props.setReminderMin}
    />
  )
}
