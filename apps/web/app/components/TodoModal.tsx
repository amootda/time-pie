'use client'

import { useState } from 'react'
import { AddModal } from './AddModal'
import type { Todo } from '@time-pie/supabase'

interface TodoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  initialData?: Partial<Todo>
}

const PRIORITIES = [
  { label: '높음', value: 'high' as const, color: 'bg-error text-white' },
  { label: '중간', value: 'medium' as const, color: 'bg-warning text-white' },
  { label: '낮음', value: 'low' as const, color: 'bg-gray-400 text-white' },
]

export function TodoModal({ isOpen, onClose, onSave, initialData }: TodoModalProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [dueDate, setDueDate] = useState(initialData?.due_date || '')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>(initialData?.priority || 'medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSave({
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
      priority,
      is_completed: false,
      completed_at: null,
      category_id: null,
    })

    // Reset form
    setTitle('')
    setDescription('')
    setDueDate('')
    setPriority('medium')
    onClose()
  }

  return (
    <AddModal isOpen={isOpen} onClose={onClose} title="할 일 추가">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">할 일</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="할 일을 입력하세요"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
            autoFocus
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">마감일 (선택)</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">우선순위</label>
          <div className="flex gap-2">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => setPriority(p.value)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  priority === p.value
                    ? `${p.color} ring-2 ring-offset-2 ring-gray-400`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="메모를 입력하세요"
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!title.trim()}
          className="w-full py-3 bg-secondary text-white rounded-xl font-medium hover:bg-secondary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          저장
        </button>
      </form>
    </AddModal>
  )
}
