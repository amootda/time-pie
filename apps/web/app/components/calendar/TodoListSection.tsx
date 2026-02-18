'use client'

import type { Todo } from '@time-pie/supabase'

interface TodoListSectionProps {
  todos: Todo[]
  selectedDate: Date
}

export function TodoListSection({ todos, selectedDate }: TodoListSectionProps) {
  if (todos.length === 0) return null

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">할 일</h4>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                todo.is_completed
                  ? 'bg-success border-success'
                  : 'border-gray-300'
              }`}
            >
              {todo.is_completed && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <path d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={`dark:text-white ${todo.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
              {todo.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
