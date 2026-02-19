'use client'

import type { Todo } from '@time-pie/supabase'
import { format, parse } from 'date-fns'
import { useEffect, useState } from 'react'
import { AddModal } from './AddModal'
import { DatePicker } from './ui/date-picker'

interface TodoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  initialData?: Partial<Todo>
  mode?: 'create' | 'edit'
}

const PRIORITIES = [
  { label: '높음', value: 'high' as const, color: 'bg-error text-white' },
  { label: '중간', value: 'medium' as const, color: 'bg-warning text-white' },
  { label: '낮음', value: 'low' as const, color: 'bg-gray-400 text-white' },
]

export function TodoModal({ isOpen, onClose, onSave, initialData, mode = 'create' }: TodoModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(initialData?.priority || 'medium')

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '')
      setDescription(initialData.description || '')
      setDueDate(initialData.due_date || '')
      setPriority(initialData.priority || 'medium')
    } else {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      priority,
      is_completed: initialData?.is_completed ?? false,
      completed_at: initialData?.completed_at ?? null,
      category_id: initialData?.category_id ?? null,
    })

    // Reset form only in create mode
    if (mode === 'create') {
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
    }
    onClose()
  }

  return (
    <AddModal isOpen={isOpen} onClose={onClose} title={mode === 'edit' ? '할 일 수정' : '할 일 추가'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">할 일</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
            autoFocus
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">마감일 (선택)</label>
          <DatePicker
            date={dueDate ? parse(dueDate, 'yyyy-MM-dd', new Date()) : undefined}
            setDate={(date) => setDueDate(date ? format(date, 'yyyy-MM-dd') : '')}
            placeholder="마감일 선택"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">우선순위</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${priority === p.value
                  ? `${p.color} ring-2 ring-offset-2 ring-gray-400`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
              >
                {p.label}
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
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {mode === 'edit' ? '수정' : '저장'}
        </button>
      </form>
    </AddModal>
  )
}
