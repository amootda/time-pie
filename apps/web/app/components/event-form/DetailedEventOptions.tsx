'use client'

import type { EventType, EventPurpose } from '@time-pie/supabase'
import { getPurposesByType } from '@time-pie/core'

// ─── Shared sub-components ────────────────────────────────────────────────────

interface PurposeSelectorProps {
  type: EventType
  purpose: EventPurpose | null
  setPurpose: (value: EventPurpose | null) => void
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
  type: EventType
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
}

function RepeatDaysSelector({ type, repeatDays, setRepeatDays }: RepeatDaysSelectorProps) {
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
        반복 요일 {type === 'soft' && <span className="text-xs text-gray-500">(선택)</span>}
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
      {type === 'soft' && repeatDays.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          선택 안하면 매일 표시됩니다
        </p>
      )}
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

interface HardEventOptionsProps {
  purpose: EventPurpose | null
  setPurpose: (value: EventPurpose | null) => void
  description: string
  setDescription: (value: string) => void
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
  isLocked: boolean
  setIsLocked: (value: boolean) => void
  location: string
  setLocation: (value: string) => void
}

function HardEventOptions({
  purpose, setPurpose,
  description, setDescription,
  repeatDays, setRepeatDays,
  isLocked, setIsLocked,
  location, setLocation,
}: HardEventOptionsProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <PurposeSelector type="hard" purpose={purpose} setPurpose={setPurpose} />
      <RepeatDaysSelector type="hard" repeatDays={repeatDays} setRepeatDays={setRepeatDays} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          장소/링크 (선택)
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="오프라인 장소 또는 URL"
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isLocked"
          checked={isLocked}
          onChange={(e) => setIsLocked(e.target.checked)}
          className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <label htmlFor="isLocked" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          다른 일정 잠금
        </label>
      </div>
      <DescriptionField description={description} setDescription={setDescription} />
    </div>
  )
}

interface AnchorEventOptionsProps {
  purpose: EventPurpose | null
  setPurpose: (value: EventPurpose | null) => void
  description: string
  setDescription: (value: string) => void
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
  bufferMin: number
  setBufferMin: (value: number) => void
}

function AnchorEventOptions({
  purpose, setPurpose,
  description, setDescription,
  repeatDays, setRepeatDays,
  bufferMin, setBufferMin,
}: AnchorEventOptionsProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <PurposeSelector type="anchor" purpose={purpose} setPurpose={setPurpose} />
      <RepeatDaysSelector type="anchor" repeatDays={repeatDays} setRepeatDays={setRepeatDays} />
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
      <DescriptionField description={description} setDescription={setDescription} />
    </div>
  )
}

interface SoftEventOptionsProps {
  purpose: EventPurpose | null
  setPurpose: (value: EventPurpose | null) => void
  description: string
  setDescription: (value: string) => void
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
  weeklyGoal: number
  setWeeklyGoal: (value: number) => void
  priority: number
  setPriority: (value: number) => void
}

function SoftEventOptions({
  purpose, setPurpose,
  description, setDescription,
  repeatDays, setRepeatDays,
  weeklyGoal, setWeeklyGoal,
  priority, setPriority,
}: SoftEventOptionsProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <PurposeSelector type="soft" purpose={purpose} setPurpose={setPurpose} />
      <RepeatDaysSelector type="soft" repeatDays={repeatDays} setRepeatDays={setRepeatDays} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          주간 목표 (회)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setWeeklyGoal(n)}
              className={`flex-1 h-10 rounded-full text-sm font-medium transition-all ${n === weeklyGoal
                  ? 'bg-primary text-white'
                  : 'border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          우선순위
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPriority(n)}
              className={`flex-1 h-10 rounded-full text-sm font-medium transition-all ${n === priority
                  ? 'bg-primary text-white'
                  : 'border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <DescriptionField description={description} setDescription={setDescription} />
    </div>
  )
}

// ─── Public API ───────────────────────────────────────────────────────────────

interface DetailedEventOptionsProps {
  type: EventType
  purpose: EventPurpose | null
  setPurpose: (value: EventPurpose | null) => void
  description: string
  setDescription: (value: string) => void
  repeatDays: number[]
  setRepeatDays: (value: number[]) => void
  // Hard
  isLocked: boolean
  setIsLocked: (value: boolean) => void
  location: string
  setLocation: (value: string) => void
  // Anchor
  bufferMin: number
  setBufferMin: (value: number) => void
  // Soft
  weeklyGoal: number
  setWeeklyGoal: (value: number) => void
  priority: number
  setPriority: (value: number) => void
}

/**
 * Renders type-specific advanced options using explicit variant components.
 * Follows vercel-composition-patterns: no optional/undefined prop branching.
 */
export function DetailedEventOptions(props: DetailedEventOptionsProps) {
  const common = {
    purpose: props.purpose,
    setPurpose: props.setPurpose,
    description: props.description,
    setDescription: props.setDescription,
    repeatDays: props.repeatDays,
    setRepeatDays: props.setRepeatDays,
  }

  if (props.type === 'hard') {
    return (
      <HardEventOptions
        {...common}
        isLocked={props.isLocked}
        setIsLocked={props.setIsLocked}
        location={props.location}
        setLocation={props.setLocation}
      />
    )
  }

  if (props.type === 'anchor') {
    return (
      <AnchorEventOptions
        {...common}
        bufferMin={props.bufferMin}
        setBufferMin={props.setBufferMin}
      />
    )
  }

  return (
    <SoftEventOptions
      {...common}
      weeklyGoal={props.weeklyGoal}
      setWeeklyGoal={props.setWeeklyGoal}
      priority={props.priority}
      setPriority={props.setPriority}
    />
  )
}
