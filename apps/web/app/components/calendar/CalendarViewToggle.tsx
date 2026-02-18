'use client'

type ViewMode = 'week' | 'month'

interface CalendarViewToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function CalendarViewToggle({ viewMode, onViewModeChange }: CalendarViewToggleProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={() => onViewModeChange('week')}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
          viewMode === 'week'
            ? 'bg-secondary text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        주간
      </button>
      <button
        onClick={() => onViewModeChange('month')}
        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
          viewMode === 'month'
            ? 'bg-secondary text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
      >
        월간
      </button>
    </div>
  )
}
