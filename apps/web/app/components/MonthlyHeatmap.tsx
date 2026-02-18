'use client'

import { useMemo } from 'react'
import type { Event, EventMonthMeta } from '@time-pie/supabase'
import dayjs from 'dayjs'

interface MonthlyHeatmapProps {
  events: (Event | EventMonthMeta)[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

interface DayCell {
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  eventCount: number
  densityColor: string
}

export function MonthlyHeatmap({ events, selectedDate, onDateSelect }: MonthlyHeatmapProps) {
  // Get month start and end
  const monthStart = useMemo(() => dayjs(selectedDate).startOf('month'), [selectedDate])
  const monthEnd = useMemo(() => dayjs(selectedDate).endOf('month'), [selectedDate])

  // Get today for highlighting
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  // Calculate event density for a specific date
  const getEventCountForDate = useMemo(() => {
    return (date: Date): number => {
      const dateStr = dayjs(date).format('YYYY-MM-DD')
      const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

      return events.filter((e) => {
        // Anchor events: check repeat_days or one-time event
        if (e.event_type === 'anchor') {
          if (e.repeat_days && e.repeat_days.length > 0) {
            return e.repeat_days.includes(dayOfWeek)
          }
          return e.start_at.startsWith(dateStr)
        }

        // Hard events: check repeat_days or one-time event
        if (e.event_type === 'hard') {
          if (!e.repeat_days || e.repeat_days.length === 0) {
            return e.start_at.startsWith(dateStr)
          }
          return e.repeat_days.includes(dayOfWeek)
        }

        // Soft events: check repeat_days or one-time event
        if (e.event_type === 'soft') {
          if (e.repeat_days && e.repeat_days.length > 0) {
            return e.repeat_days.includes(dayOfWeek)
          }
          return e.start_at.startsWith(dateStr)
        }

        // Fallback
        return e.start_at.startsWith(dateStr)
      }).length
    }
  }, [events])

  // Get density color based on event count
  const getDensityColor = (count: number): string => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800'
    if (count <= 2) return 'bg-gray-200 dark:bg-gray-700'
    if (count <= 5) return 'bg-cyan-300 dark:bg-cyan-700'
    return 'bg-cyan-600 dark:bg-cyan-500'
  }

  // Generate calendar grid (35-42 cells)
  const calendarDays = useMemo((): DayCell[] => {
    const days: DayCell[] = []

    // Get first day of week (0=Sun, 1=Mon, ..., 6=Sat)
    const firstDayOfWeek = monthStart.day()

    // Calculate how many days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek

    // Start from the first day shown (may be from previous month)
    const calendarStart = monthStart.subtract(daysFromPrevMonth, 'day')

    // Generate 42 days (6 weeks) to ensure full grid
    for (let i = 0; i < 42; i++) {
      const date = calendarStart.add(i, 'day').toDate()
      const isCurrentMonth = dayjs(date).month() === monthStart.month()

      // Check if this is today
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)
      const isToday = dateOnly.getTime() === today.getTime()

      // Get event count for this date
      const eventCount = getEventCountForDate(date)
      const densityColor = getDensityColor(eventCount)

      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday,
        eventCount,
        densityColor,
      })
    }

    return days
  }, [monthStart, today, getEventCountForDate])

  // Format month/year display
  const monthYearText = useMemo(() => {
    return monthStart.format('YYYY년 M월')
  }, [monthStart])

  // Navigation handlers
  const handlePrevMonth = () => {
    const newDate = dayjs(selectedDate).subtract(1, 'month').toDate()
    onDateSelect(newDate)
  }

  const handleNextMonth = () => {
    const newDate = dayjs(selectedDate).add(1, 'month').toDate()
    onDateSelect(newDate)
  }

  const handleToday = () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    onDateSelect(now)
  }

  const handleDayClick = (date: Date) => {
    onDateSelect(date)
  }

  return (
    <div className="w-full">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-foreground text-lg font-semibold">
          {monthYearText}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="이전 월"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
          >
            오늘
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="다음 월"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={index}
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(day.date)}
            className={`
              aspect-square flex flex-col items-center justify-center
              rounded-lg transition-all duration-200
              ${day.densityColor}
              ${day.isCurrentMonth ? '' : 'opacity-40'}
              ${day.isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
              hover:ring-2 hover:ring-primary
              cursor-pointer
            `}
          >
            {/* Day Number */}
            <span
              className={`
                text-sm font-semibold
                ${day.isToday ? 'text-primary' : day.eventCount > 5 ? 'text-white' : 'text-foreground'}
              `}
            >
              {day.dayNumber}
            </span>

            {/* Event Count (optional, small text) */}
            {day.eventCount > 0 && (
              <span
                className={`
                  text-xs mt-0.5
                  ${day.eventCount > 5 ? 'text-white/80' : 'text-muted-foreground'}
                `}
              >
                {day.eventCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
