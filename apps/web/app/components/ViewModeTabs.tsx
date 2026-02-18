'use client'

interface ViewModeTabsProps {
  mode: 'day' | 'week' | 'month'
  onModeChange: (mode: 'day' | 'week' | 'month') => void
}

export function ViewModeTabs({ mode, onModeChange }: ViewModeTabsProps) {
  return (
    <div className="flex items-center justify-center mb-6">
      <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1">
        <button
          onClick={() => onModeChange('day')}
          className={`
            px-6 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${
              mode === 'day'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          일간
        </button>
        <button
          onClick={() => onModeChange('week')}
          className={`
            px-6 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${
              mode === 'week'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          주간
        </button>
        <button
          onClick={() => onModeChange('month')}
          className={`
            px-6 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${
              mode === 'month'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          월간
        </button>
      </div>
    </div>
  )
}
