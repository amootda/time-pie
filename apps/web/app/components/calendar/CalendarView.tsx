'use client'

import { WeeklyPieView, MonthlyHeatmap } from '..'
import type { EventMonthMeta } from '@time-pie/supabase'

type ViewMode = 'week' | 'month'

interface CalendarViewProps {
  viewMode: ViewMode
  events: EventMonthMeta[]
  selectedDate: Date
  currentMonth: Date
  onDateSelect: (date: Date) => void
  onMonthChange: (date: Date) => void
}

export function CalendarView({
  viewMode,
  events,
  selectedDate,
  currentMonth,
  onDateSelect,
  onMonthChange,
}: CalendarViewProps) {
  if (viewMode === 'month') {
    return (
      <MonthlyHeatmap
        events={events}
        selectedDate={currentMonth}
        onDateSelect={(date) => {
          onMonthChange(date)
          onDateSelect(date)
        }}
      />
    )
  }

  return (
    <WeeklyPieView
      events={events}
      selectedDate={selectedDate}
      onDateSelect={onDateSelect}
    />
  )
}
