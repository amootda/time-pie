'use client'

import { toDateString } from '@time-pie/core'
import type { EventType } from '@time-pie/supabase'
import { format, parse } from 'date-fns'
import { ChevronDown } from 'lucide-react'
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
  endDate: string
  setEndDate: (value: string) => void
  error?: string | null
  setError?: (value: string | null) => void
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
  endDate,
  setEndDate,
  error,
  setError,
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

      {type === 'anchor' ? (
        <>
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
          {/* Time Range */}
          <div className="flex items-center gap-1.5 mt-1">
            <div className="flex-1">
              <DatePicker
                date={startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : undefined}
                setDate={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                placeholder="날짜 선택"
              />
            </div>
            <div className="flex-[0.8]">
              <TimePicker
                value={startTime}
                onChange={(newStartTime) => {
                  setStartTime(newStartTime)
                  if (endTime && endTime <= newStartTime) {
                    const [h, m] = newStartTime.split(':').map(Number)
                    const totalMin = h * 60 + m + 60
                    const clamped = Math.min(totalMin, 23 * 60 + 59)
                    const newH = Math.floor(clamped / 60)
                    const newM = clamped % 60
                    setEndTime(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`)
                  }
                }}
              />
            </div>
            <span className="text-gray-400 font-medium px-0.5">-</span>
            <div className="flex-[0.8]">
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                minTime={startTime}
              />
            </div>
          </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex-1">
            <DatePicker
              date={startDate ? parse(startDate, 'yyyy-MM-dd', new Date()) : undefined}
              setDate={(date) => {
                const newDate = date ? format(date, 'yyyy-MM-dd') : ''
                setStartDate(newDate)
                if (newDate && endDate && newDate > endDate) {
                  setEndDate(newDate)
                }
                if (setError) setError(null)
              }}
              placeholder="시작 날짜"
            />
          </div>
          <div className="flex-[0.8]">
            <TimePicker
              value={startTime}
              onChange={(newStartTime) => {
                setStartTime(newStartTime)
                if (startDate === endDate && endTime && endTime <= newStartTime) {
                  const [h, m] = newStartTime.split(':').map(Number)
                  const totalMin = h * 60 + m + 60
                  const clamped = Math.min(totalMin, 23 * 60 + 59)
                  const newStartMin = h * 60 + m
                  if (clamped <= newStartMin) {
                    // clamped 종료 시간이 여전히 시작보다 빠르거나 같으면 날짜를 하루 넘김
                    const startDateObj = parse(startDate, 'yyyy-MM-dd', new Date())
                    const nextDay = new Date(startDateObj.getTime() + 24 * 60 * 60 * 1000)
                    setEndDate(format(nextDay, 'yyyy-MM-dd'))
                    const rolledMin = Math.min(totalMin - 24 * 60, 23 * 60 + 59)
                    const rolledH = Math.floor(rolledMin / 60)
                    const rolledM = rolledMin % 60
                    setEndTime(`${rolledH.toString().padStart(2, '0')}:${rolledM.toString().padStart(2, '0')}`)
                  } else {
                    const newH = Math.floor(clamped / 60)
                    const newM = clamped % 60
                    setEndTime(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`)
                  }
                }
                if (setError) setError(null)
              }}
            />
          </div>
          <span className="text-gray-400 font-medium px-0.5">-</span>
          <div className="flex-[0.8]">
            <TimePicker
              value={endTime}
              onChange={(newEndTime) => {
                setEndTime(newEndTime)
                if (setError) setError(null)
              }}
              minTime={startDate === endDate ? startTime : undefined}
            />
          </div>
          <div className="flex-1">
            <DatePicker
              date={endDate ? parse(endDate, 'yyyy-MM-dd', new Date()) : undefined}
              setDate={(date) => {
                const newDate = date ? format(date, 'yyyy-MM-dd') : ''
                setEndDate(newDate)
                if (newDate && startDate && newDate < startDate) {
                  setStartDate(newDate)
                }
                if (setError) setError(null)
              }}
              placeholder="종료 날짜"
            />
          </div>
        </div>
      )}

      {error && type === 'task' && (
        <div className="text-sm text-red-500 font-medium px-1">
          {error}
        </div>
      )}

      {/* Color Picker */}
      <ColorPicker
        selectedColor={selectedColor}
        onColorChange={onColorChange}
        showLabel={true}
      />

      {/* Expand/Collapse Button */}
      <button
        type="button"
        onClick={onExpand}
        className="w-full py-2.5 text-sm font-medium text-primary hover:text-primary-600 transition-colors flex items-center justify-center gap-1"
      >
        <span>{isExpanded ? '접기' : '더 많은 옵션'}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}
