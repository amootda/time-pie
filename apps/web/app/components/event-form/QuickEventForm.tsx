'use client'

import { toDateString } from '@time-pie/core'
import type { EventType } from '@time-pie/supabase'
import { format, parse } from 'date-fns'
import { DatePicker } from '../ui/date-picker'
import { TimePicker } from '../ui/time-picker'
import { ColorPicker } from './ColorPicker'
import { PurposeQuickSelector } from './PurposeQuickSelector'

interface QuickEventFormProps {
  type: EventType
  selectedDate: Date
  onExpand: () => void
  isExpanded: boolean
  // Form state passed from parent
  title: string
  setTitle: (value: string) => void
  purpose: string | null
  setPurpose: (value: string | null) => void
  selectedColor: string
  onColorChange: (value: string) => void
  startTime: string
  setStartTime: (value: string) => void
  endTime: string
  setEndTime: (value: string) => void
  startDate: string
  setStartDate: (value: string) => void
}

/**
 * Quick event creation form with only essential fields
 * Designed for mobile-first UX: 3 taps to create an event
 */
export function QuickEventForm({
  type,
  selectedDate,
  onExpand,
  isExpanded,
  title,
  setTitle,
  purpose,
  setPurpose,
  selectedColor,
  onColorChange,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  startDate,
  setStartDate,
}: QuickEventFormProps) {
  // Quick date buttons
  const today = toDateString(new Date())
  const tomorrow = toDateString(new Date(Date.now() + 24 * 60 * 60 * 1000))

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="일정 제목을 입력하세요"
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          autoFocus
        />
      </div>

      {/* Purpose Quick Selector */}
      <PurposeQuickSelector
        selectedPurpose={purpose}
        eventType={type}
        onSelect={setPurpose}
        onShowAll={onExpand}
      />

      {/* Quick Date Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          날짜
        </label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setStartDate(today)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${startDate === today
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            오늘
          </button>
          <button
            type="button"
            onClick={() => setStartDate(tomorrow)}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${startDate === tomorrow
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            내일
          </button>
        </div>
        <DatePicker
          date={startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : undefined}
          setDate={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
          placeholder="날짜 선택"
        />
      </div>

      {/* Time Range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            시작
          </label>
          <TimePicker
            value={startTime}
            onChange={setStartTime}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            종료
          </label>
          <TimePicker
            value={endTime}
            onChange={setEndTime}
          />
        </div>
      </div>

      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        showLabel={true}
      />

      {/* Expand Button */}
      {!isExpanded && (
        <button
          type="button"
          onClick={onExpand}
          className="w-full py-2.5 text-sm font-medium text-primary hover:text-primary-600 transition-colors flex items-center justify-center gap-1"
        >
          <span>더 많은 옵션</span>
          <span className="text-lg">▼</span>
        </button>
      )}
    </div>
  )
}
