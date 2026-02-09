'use client'

import { useState } from 'react'
import { AddModal } from './AddModal'
import type { Habit } from '@time-pie/supabase'

interface HabitModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  initialData?: Partial<Habit>
}

const COLORS = [
  '#FF6B35', '#4A90D9', '#2ECC71', '#9B59B6', '#E74C3C', '#F39C12',
]

const FREQUENCIES = [
  { label: '매일', value: 'daily' as const },
  { label: '매주', value: 'weekly' as const },
]

export function HabitModal({ isOpen, onClose, onSave, initialData }: HabitModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'custom'>(initialData?.frequency || 'daily')
  const [targetCount, setTargetCount] = useState(initialData?.target_count || 1)
  const [color, setColor] = useState(initialData?.color || COLORS[0])
  const [reminderTime, setReminderTime] = useState(initialData?.reminder_time || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      frequency,
      frequency_config: {},
      target_count: targetCount,
      color,
      reminder_time: reminderTime || null,
      is_active: true,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setFrequency('daily')
    setTargetCount(1)
    setColor(COLORS[0])
    setReminderTime('')
    onClose()
  }

  return (
    <AddModal isOpen={isOpen} onClose={onClose} title="습관 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">습관 이름</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 물 2L 마시기"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-success/50 focus:border-success"
            autoFocus
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">반복 주기</label>
          <div className="flex gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFrequency(f.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${frequency === f.value
                    ? 'bg-success text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target Count */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">목표 횟수</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center text-xl font-medium dark:text-white"
            >
              -
            </button>
            <span className="text-2xl font-bold w-12 text-center dark:text-white">{targetCount}</span>
            <button
              type="button"
              onClick={() => setTargetCount(targetCount + 1)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-medium"
            >
              +
            </button>
            <span className="text-gray-500 dark:text-gray-400 text-sm">회 / {frequency === 'daily' ? '일' : '주'}</span>
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">색상</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                  }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Reminder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">리마인더 시간 (선택)</label>
          <input
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-success/50 focus:border-success"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">설명 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="습관에 대한 설명을 입력하세요"
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-success/50 focus:border-success resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full py-3 bg-success text-white rounded-xl font-medium hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          저장
        </button>
      </form>
    </AddModal>
  )
}
