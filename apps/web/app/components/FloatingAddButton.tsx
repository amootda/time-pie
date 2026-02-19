'use client'

import { Plus } from 'lucide-react'

interface FloatingAddButtonProps {
  onAddEvent?: () => void
  onAddTodo?: () => void
  onAddHabit?: () => void
}

export function FloatingAddButton({ onAddEvent, onAddTodo, onAddHabit }: FloatingAddButtonProps) {
  return (
    <div className="fixed right-6 z-20 bottom-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* Main FAB - 이미지처럼 단순한 청록색 버튼 */}
      <button
        onClick={onAddEvent || onAddTodo || onAddHabit}
        className="w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-600 transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
      >
        <Plus className="w-8 h-8" strokeWidth={3} />
      </button>
    </div>
  )
}
