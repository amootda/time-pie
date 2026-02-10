'use client'

import { useState } from 'react'
import { AddModal } from './AddModal'
import { toDateString } from '@time-pie/core'
import type { Event } from '@time-pie/supabase'

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  initialData?: Partial<Event>
  selectedDate?: Date
}

const COLORS = [
  { name: '업무', value: '#4A90D9' },
  { name: '개인', value: '#2ECC71' },
  { name: '미팅', value: '#9B59B6' },
  { name: '운동', value: '#E74C3C' },
  { name: '수면', value: '#34495E' },
  { name: '식사', value: '#F39C12' },
]

export function EventModal({ isOpen, onClose, onSave, initialData, selectedDate }: EventModalProps) {
  const defaultDate = selectedDate || new Date()
  const dateStr = toDateString(defaultDate)

  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [startDate, setStartDate] = useState(dateStr)
  const [startTime, setStartTime] = useState(initialData?.start_at?.split('T')[1]?.slice(0, 5) || '09:00')
  const [endTime, setEndTime] = useState(initialData?.end_at?.split('T')[1]?.slice(0, 5) || '10:00')
  const [color, setColor] = useState(initialData?.color || COLORS[0].value)
  const [isAllDay, setIsAllDay] = useState(initialData?.is_all_day || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const startAt = isAllDay
      ? `${startDate}T00:00:00`
      : `${startDate}T${startTime}:00`
    const endAt = isAllDay
      ? `${startDate}T23:59:59`
      : `${startDate}T${endTime}:00`

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      start_at: startAt,
      end_at: endAt,
      is_all_day: isAllDay,
      color,
      category_id: null,
      reminder_min: 15,
    })

    // Reset form
    setTitle('')
    setDescription('')
    onClose()
  }

  return (
    <AddModal isOpen={isOpen} onClose={onClose} title="일정 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        {/* Time */}
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

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">카테고리</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${color === c.value
                    ? 'ring-2 ring-offset-2 ring-gray-400'
                    : 'hover:opacity-80'
                  }`}
                style={{ backgroundColor: c.value, color: 'white' }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

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

        {/* Submit */}
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          저장
        </button>
      </form>
    </AddModal>
  )
}
