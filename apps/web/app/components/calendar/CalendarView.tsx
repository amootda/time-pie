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
  weekStartDay?: 0 | 1
  onWeekStartDayChange?: (day: 0 | 1) => void
}

export function CalendarView({
  viewMode,
  events,
  selectedDate,
  currentMonth,
  onDateSelect,
  onMonthChange,
  weekStartDay,
  onWeekStartDayChange,
}: CalendarViewProps) {
  // if (viewMode === 'month') {
  return (
    <MonthlyHeatmap
      events={events}
      selectedDate={currentMonth}
      onDateSelect={(date) => {
        onMonthChange(date)
        onDateSelect(date)
      }}
      weekStartDay={weekStartDay}
      onWeekStartDayChange={onWeekStartDayChange}
    />
  )
  // }

  // return (
  //   <WeeklyPieView
  //     events={events}
  //     selectedDate={selectedDate}
  //     onDateSelect={onDateSelect}
  //   />
  // )
}
