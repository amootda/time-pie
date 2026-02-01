'use client'

import { useState } from 'react'

interface FloatingAddButtonProps {
  onAddEvent?: () => void
  onAddTodo?: () => void
  onAddHabit?: () => void
}

export function FloatingAddButton({ onAddEvent, onAddTodo, onAddHabit }: FloatingAddButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const actions = [
    { label: '일정', icon: '📅', onClick: onAddEvent, color: 'bg-primary' },
    { label: '투두', icon: '✅', onClick: onAddTodo, color: 'bg-secondary' },
    { label: '습관', icon: '⭐', onClick: onAddHabit, color: 'bg-success' },
  ]

  return (
    <div className="fixed bottom-20 right-4 z-20">
      {/* Action buttons */}
      <div
        className={`flex flex-col-reverse gap-2 mb-2 transition-all duration-200 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => {
              action.onClick?.()
              setIsOpen(false)
            }}
            className={`flex items-center gap-2 px-4 py-2 ${action.color} text-white rounded-full shadow-lg hover:shadow-xl transition-shadow`}
          >
            <span>{action.icon}</span>
            <span className="text-sm font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  )
}
