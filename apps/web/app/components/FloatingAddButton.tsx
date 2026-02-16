'use client'

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
        className="w-16 h-16 rounded-full bg-cyan-500 text-white shadow-2xl hover:bg-cyan-400 transition-all duration-200 flex items-center justify-center hover:scale-110"
      >
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  )
}
