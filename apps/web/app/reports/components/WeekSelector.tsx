'use client'

import { memo, useEffect, useRef } from 'react'

interface WeekSelectorProps {
  weeks: Array<{ weekStart: string; weekEnd: string }>
  selectedWeekStart: string | null
  onSelect: (weekStart: string) => void
}

function formatWeekLabel(weekStart: string, weekEnd: string) {
  const start = new Date(weekStart + 'T00:00:00')
  const end = new Date(weekEnd + 'T00:00:00')
  return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`
}

export const WeekSelector = memo(function WeekSelector({
  weeks,
  selectedWeekStart,
  onSelect,
}: WeekSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0
    }
  }, [])

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4"
    >
      {weeks.map(({ weekStart, weekEnd }) => {
        const isSelected = selectedWeekStart === weekStart
        return (
          <button
            key={weekStart}
            onClick={() => onSelect(weekStart)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {formatWeekLabel(weekStart, weekEnd)}
          </button>
        )
      })}
    </div>
  )
})
