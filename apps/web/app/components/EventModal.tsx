'use client'

import { useState, useEffect } from 'react'
import { AddModal } from './AddModal'
import { toDateString, SCHEDULE_TYPES, getPurposesByType, PREFERRED_WINDOWS, getPurposeInfo } from '@time-pie/core'
import type { Event, EventType, EventPurpose, PreferredWindow } from '@time-pie/supabase'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void> | void
  initialData?: Partial<Event>
  selectedDate?: Date
}

export function EventModal({ isOpen, onClose, onSave, initialData, selectedDate }: EventModalProps) {
  const defaultDate = selectedDate || new Date()
  const dateStr = toDateString(defaultDate)

  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [scheduleType, setScheduleType] = useState<EventType>('hard')
  const [purpose, setPurpose] = useState<EventPurpose | null>(initialData?.purpose || null)

  // Hard type fields
  const [startDate, setStartDate] = useState(dateStr)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [isAllDay, setIsAllDay] = useState(false)
  const [repeatDays, setRepeatDays] = useState<number[]>([])
  const [isLocked, setIsLocked] = useState(false)
  const [location, setLocation] = useState('')

  // Anchor type fields
  const [baseTime, setBaseTime] = useState('07:00')
  const [targetDurationMin, setTargetDurationMin] = useState(60)
  const [bufferMin, setBufferMin] = useState(15)

  // Soft type fields
  const [weeklyGoal, setWeeklyGoal] = useState(3)
  const [preferredWindow, setPreferredWindow] = useState<PreferredWindow>('evening')
  const [priority, setPriority] = useState(3)

  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      const defaultDate = selectedDate || new Date()
      const dateStr = toDateString(defaultDate)

      setTitle(initialData?.title || '')
      setDescription(initialData?.description || '')
      setScheduleType(initialData?.event_type || 'hard')
      setPurpose(initialData?.purpose || null)

      // Hard type fields
      setStartDate(initialData?.start_at?.split('T')[0] || dateStr)
      setStartTime(initialData?.start_at?.split('T')[1]?.slice(0, 5) || '09:00')
      setEndTime(initialData?.end_at?.split('T')[1]?.slice(0, 5) || '10:00')
      setIsAllDay(initialData?.is_all_day || false)
      setRepeatDays(initialData?.repeat_days || [])
      setIsLocked(initialData?.is_locked || false)
      setLocation(initialData?.location || '')

      // Anchor type fields
      setBaseTime(initialData?.base_time || '07:00')
      setTargetDurationMin(initialData?.target_duration_min || 60)
      setBufferMin(initialData?.buffer_min || 15)

      // Soft type fields
      setWeeklyGoal(initialData?.weekly_goal || 3)
      setPreferredWindow(initialData?.preferred_window || 'evening')
      setPriority(initialData?.priority || 3)

      setIsSaving(false)
      setSaveError(null)
    }
  }, [isOpen, initialData, selectedDate])

  const toggleRepeatDay = (dayIndex: number) => {
    setRepeatDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || isSaving) return

    setIsSaving(true)
    setSaveError(null)

    try {
      const purposeInfo = getPurposeInfo(purpose)
      let eventData: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>

      if (scheduleType === 'anchor') {
        // Anchor: start_at = date + base_time, end_at = start_at + target_duration_min
        const startAt = `${startDate}T${baseTime}:00`
        const startDateTime = new Date(startAt)
        const endDateTime = new Date(startDateTime.getTime() + targetDurationMin * 60 * 1000)
        const endAt = endDateTime.toISOString().slice(0, 19)

        eventData = {
          title: title.trim(),
          description: description.trim() || null,
          start_at: startAt,
          end_at: endAt,
          is_all_day: false,
          event_type: 'anchor',
          color: purposeInfo?.color ?? '#4A90D9',
          purpose,
          category_id: null,
          reminder_min: null,
          base_time: baseTime,
          target_duration_min: targetDurationMin,
          buffer_min: bufferMin,
          repeat_days: null,
          is_locked: false,
          location: null,
          weekly_goal: null,
          preferred_window: null,
          priority: null,
        }
      } else if (scheduleType === 'hard') {
        // Hard: use existing startTime/endTime logic
        const startAt = isAllDay
          ? `${startDate}T00:00:00`
          : `${startDate}T${startTime}:00`
        const endAt = isAllDay
          ? `${startDate}T23:59:59`
          : `${startDate}T${endTime}:00`

        eventData = {
          title: title.trim(),
          description: description.trim() || null,
          start_at: startAt,
          end_at: endAt,
          is_all_day: isAllDay,
          event_type: 'hard',
          color: purposeInfo?.color ?? '#4A90D9',
          purpose,
          category_id: null,
          reminder_min: null,
          repeat_days: repeatDays.length > 0 ? repeatDays : null,
          is_locked: isLocked,
          location: location.trim() || null,
          base_time: null,
          target_duration_min: null,
          buffer_min: null,
          weekly_goal: null,
          preferred_window: null,
          priority: null,
        }
      } else {
        // Soft: placeholder times, goal-based
        const startAt = `${startDate}T12:00:00`
        const endAt = `${startDate}T13:00:00`

        eventData = {
          title: title.trim(),
          description: description.trim() || null,
          start_at: startAt,
          end_at: endAt,
          is_all_day: false,
          event_type: 'soft',
          color: purposeInfo?.color ?? '#4A90D9',
          purpose,
          category_id: null,
          reminder_min: null,
          weekly_goal: weeklyGoal,
          preferred_window: preferredWindow,
          priority,
          base_time: null,
          target_duration_min: null,
          buffer_min: null,
          repeat_days: null,
          is_locked: false,
          location: null,
        }
      }

      await onSave(eventData)

      // Reset form only on success
      setTitle('')
      setDescription('')
      onClose()
    } catch (error) {
      console.error('Event save failed:', error)
      const msg = error instanceof Error ? error.message
        : typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: unknown }).message)
        : '저장에 실패했습니다'
      setSaveError(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AddModal isOpen={isOpen} onClose={onClose} title="일정 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Schedule Type Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
          {SCHEDULE_TYPES.map((type) => (
            <button
              key={type.key}
              type="button"
              onClick={() => setScheduleType(type.key)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                scheduleType === type.key
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="text-base mb-0.5">{type.emoji}</div>
              <div>{type.label}</div>
            </button>
          ))}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="일정 제목을 입력하세요"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            autoFocus
          />
        </div>

        {/* Purpose selector - filtered by type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">약속 유형</label>
          <div className="grid grid-cols-3 gap-2">
            {getPurposesByType(scheduleType).map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPurpose(p.key)}
                className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-medium transition-all border-2 ${
                  purpose === p.key
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

        {/* === Anchor Form === */}
        {scheduleType === 'anchor' && (
          <>
            {/* Base Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">기준 시간</label>
              <input
                type="time"
                value={baseTime}
                onChange={(e) => setBaseTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Target Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">목표 시간 (분)</label>
              <input
                type="number"
                value={targetDurationMin}
                onChange={(e) => setTargetDurationMin(Number(e.target.value))}
                min={15}
                max={720}
                step={15}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* Buffer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">유동 허용 (분)</label>
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

            {/* Daily badge */}
            <div className="text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
              ⚓ 매일 자동 반복됩니다
            </div>
          </>
        )}

        {/* === Hard Form === */}
        {scheduleType === 'hard' && (
          <>
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">날짜</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="allDay"
                checked={isAllDay}
                onChange={(e) => setIsAllDay(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="allDay" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                하루 종일
              </label>
            </div>

            {/* Start/End Time */}
            {!isAllDay && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">시작</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">종료</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>
            )}

            {/* Repeat Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">반복 요일</label>
              <div className="flex gap-1">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleRepeatDay(i)}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                      repeatDays.includes(i)
                        ? 'bg-primary text-white'
                        : 'border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            {/* Lock toggle */}
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

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">장소/링크 (선택)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="오프라인 장소 또는 URL"
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          </>
        )}

        {/* === Soft Form === */}
        {scheduleType === 'soft' && (
          <>
            {/* Weekly Goal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">주간 목표 (회)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setWeeklyGoal(n)}
                    className={`flex-1 h-10 rounded-full text-sm font-medium transition-all ${
                      n === weeklyGoal
                        ? 'bg-primary text-white'
                        : 'border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Window */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">선호 시간대</label>
              <div className="grid grid-cols-4 gap-2">
                {PREFERRED_WINDOWS.map((w) => (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => setPreferredWindow(w.key as PreferredWindow)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium transition-all border-2 ${
                      w.key === preferredWindow
                        ? 'border-primary bg-primary/10 text-primary dark:text-primary'
                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{w.label}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{w.range}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">우선순위</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPriority(n)}
                    className={`flex-1 h-10 rounded-full text-sm font-medium transition-all ${
                      n === priority
                        ? 'bg-primary text-white'
                        : 'border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">메모 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="메모를 입력하세요"
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
        </div>

        {/* Error */}
        {saveError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {saveError}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!title.trim() || isSaving}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </form>
    </AddModal>
  )
}
