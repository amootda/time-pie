'use client'

import { ANCHOR_DEFAULT_COLOR, getPurposeInfo, toDateString } from '@time-pie/core'
import type { Event, EventType } from '@time-pie/supabase'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useEffect, useState } from 'react'
import { AddModal } from './AddModal'
import { DetailedEventOptions } from './event-form/DetailedEventOptions'
import { EventTypeTab } from './event-form/EventTypeTab'
import { QuickEventForm } from './event-form/QuickEventForm'

dayjs.extend(customParseFormat)

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void> | void
  onDelete?: (id: string) => Promise<void> | void
  initialData?: Partial<Event>
  selectedDate?: Date
}

/**
 * Refactored EventModal - Orchestrator pattern
 * 2 types: anchor | task
 */
export function EventModal({ isOpen, onClose, onSave, onDelete, initialData, selectedDate }: EventModalProps) {
  const defaultDate = selectedDate || new Date()
  const dateStr = toDateString(defaultDate)

  // Core state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [scheduleType, setScheduleType] = useState<EventType>('task')
  const [purpose, setPurpose] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Shared time fields
  const [startDate, setStartDate] = useState(dateStr)
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [repeatDays, setRepeatDays] = useState<number[]>([])

  // Anchor fields
  const [baseTime, setBaseTime] = useState('07:00')
  const [anchorEndTime, setAnchorEndTime] = useState('08:00')
  const [bufferMin, setBufferMin] = useState(15)

  // Alarm
  const [reminderMin, setReminderMin] = useState<number | null>(null)

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaultDate = selectedDate || new Date()
      const dateStr = toDateString(defaultDate)

      setTitle(initialData?.title || '')
      setDescription(initialData?.description || '')
      setScheduleType(initialData?.event_type || 'task')
      setPurpose(initialData?.purpose || null)
      setShowAdvanced(false)

      // Time fields
      const isRecurring = initialData?.event_type === 'anchor'
      setStartDate(isRecurring ? dateStr : (initialData?.start_at ? dayjs(initialData.start_at).format('YYYY-MM-DD') : dateStr))
      setStartTime(initialData?.start_at ? dayjs(initialData.start_at).format('HH:mm') : '09:00')
      setEndTime(initialData?.end_at ? dayjs(initialData.end_at).format('HH:mm') : '10:00')
      setRepeatDays(initialData?.repeat_days || [])

      // Anchor fields
      setBaseTime(initialData?.base_time || '07:00')
      if (initialData?.base_time && initialData?.target_duration_min) {
        const [hours, minutes] = initialData.base_time.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + initialData.target_duration_min
        const endHours = Math.floor(totalMinutes / 60) % 24
        const endMinutes = totalMinutes % 60
        setAnchorEndTime(`${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`)
      } else {
        setAnchorEndTime('08:00')
      }
      setBufferMin(initialData?.buffer_min || 15)

      // Alarm
      setReminderMin(initialData?.reminder_min ?? null)

      setIsSaving(false)
      setSaveError(null)
      setShowDeleteConfirm(false)
    }
  }, [isOpen, initialData, selectedDate])

  const handleDelete = async () => {
    if (!initialData?.id || !onDelete || isDeleting) return

    setIsDeleting(true)
    try {
      await onDelete(initialData.id)
      setShowDeleteConfirm(false)
      onClose()
    } catch (error) {
      console.error('Delete failed:', error)
      setSaveError('삭제에 실패했습니다')
    } finally {
      setIsDeleting(false)
    }
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
        const [startHours, startMinutes] = baseTime.split(':').map(Number)
        const [endHours, endMinutes] = anchorEndTime.split(':').map(Number)
        const startTotalMin = startHours * 60 + startMinutes
        const endTotalMin = endHours * 60 + endMinutes
        const targetDurationMin = endTotalMin >= startTotalMin
          ? endTotalMin - startTotalMin
          : (24 * 60 - startTotalMin) + endTotalMin

        const startDateTime = dayjs(`${startDate} ${baseTime}`, 'YYYY-MM-DD HH:mm')
        const endDateTime = startDateTime.add(targetDurationMin, 'minute')

        eventData = {
          title: title.trim(),
          description: description.trim() || null,
          start_at: startDateTime.format('YYYY-MM-DDTHH:mm:ssZ'),
          end_at: endDateTime.format('YYYY-MM-DDTHH:mm:ssZ'),
          is_all_day: false,
          event_type: 'anchor',
          color: ANCHOR_DEFAULT_COLOR,
          purpose,
          category_id: null,
          reminder_min: reminderMin,
          base_time: baseTime,
          target_duration_min: targetDurationMin,
          buffer_min: bufferMin,
          repeat_days: repeatDays.length > 0 ? repeatDays : null,
        }
      } else {
        // task
        const startAt = dayjs(`${startDate}T${startTime}`, 'YYYY-MM-DDTHH:mm').format('YYYY-MM-DDTHH:mm:ssZ')
        const endAt = dayjs(`${startDate}T${endTime}`, 'YYYY-MM-DDTHH:mm').format('YYYY-MM-DDTHH:mm:ssZ')

        eventData = {
          title: title.trim(),
          description: description.trim() || null,
          start_at: startAt,
          end_at: endAt,
          is_all_day: false,
          event_type: 'task',
          color: purposeInfo?.color ?? '#4A90D9',
          purpose,
          category_id: null,
          reminder_min: reminderMin,
          base_time: null,
          target_duration_min: null,
          buffer_min: null,
          repeat_days: repeatDays.length > 0 ? repeatDays : null,
        }
      }

      await onSave(eventData)
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
    <AddModal isOpen={isOpen} onClose={onClose} title={initialData ? "일정 수정" : "일정 추가"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Event Type Selector */}
        <EventTypeTab
          selectedType={scheduleType}
          onSelect={(type) => {
            setScheduleType(type)
            setPurpose(null)
          }}
        />

        {/* Quick Form (always visible) */}
        <QuickEventForm
          type={scheduleType}
          selectedDate={defaultDate}
          onExpand={() => setShowAdvanced(true)}
          isExpanded={showAdvanced}
          title={title}
          setTitle={setTitle}
          purpose={purpose}
          setPurpose={setPurpose}
          startTime={scheduleType === 'anchor' ? baseTime : startTime}
          setStartTime={scheduleType === 'anchor' ? setBaseTime : setStartTime}
          endTime={scheduleType === 'anchor' ? anchorEndTime : endTime}
          setEndTime={scheduleType === 'anchor' ? setAnchorEndTime : setEndTime}
          startDate={startDate}
          setStartDate={setStartDate}
        />

        {/* Detailed Options (collapsible) */}
        {showAdvanced && (
          <DetailedEventOptions
            type={scheduleType}
            purpose={purpose}
            setPurpose={setPurpose}
            description={description}
            setDescription={setDescription}
            repeatDays={repeatDays}
            setRepeatDays={setRepeatDays}
            bufferMin={bufferMin}
            setBufferMin={setBufferMin}
            reminderMin={reminderMin}
            setReminderMin={setReminderMin}
          />
        )}

        {/* Error */}
        {saveError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
            {saveError}
          </div>
        )}

        {/* Delete button - edit mode only */}
        {initialData && onDelete && (
          showDeleteConfirm ? (
            <div className="space-y-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                정말로 이 일정을 삭제하시겠습니까?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isDeleting ? '삭제 중...' : '삭제'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              일정 삭제
            </button>
          )
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
