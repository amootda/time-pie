'use client'

import { isSameLocalDate } from '@time-pie/core'
import type { Event, EventMonthMeta } from '@time-pie/supabase'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

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
  events: (Event | EventMonthMeta)[]
  densityColor: string
}

export function MonthlyHeatmap({
  events,
  selectedDate,
  onDateSelect,
}: MonthlyHeatmapProps) {
  // Get month start and end
  const monthStart = useMemo(
    () => dayjs(selectedDate).startOf('month'),
    [selectedDate]
  )
  const monthEnd = useMemo(
    () => dayjs(selectedDate).endOf('month'),
    [selectedDate]
  )

  // Get today for highlighting
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [])

  // Calculate events for a specific date
  const getEventsForDate = useMemo(() => {
    return (date: Date): (Event | EventMonthMeta)[] => {
      const dateStr = dayjs(date).format('YYYY-MM-DD')
      const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

      return events.filter((e) => {
        // Anchor events: do not count in heatmap
        if (e.event_type === 'anchor') {
          return false
        }

        // Task events: check repeat_days or one-time event
        if (e.repeat_days && e.repeat_days.length > 0) {
          return e.repeat_days.includes(dayOfWeek)
        }
        return isSameLocalDate(e.start_at, dateStr)
      })
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

      // Get events for this date
      const dateEvents = getEventsForDate(date)
      const eventCount = dateEvents.length
      const densityColor = getDensityColor(eventCount)

      days.push({
        date,
        dayNumber: date.getDate(),
        isCurrentMonth,
        isToday,
        eventCount,
        densityColor,
        events: dateEvents,
      })
    }

    return days
  }, [monthStart, today, getEventsForDate])

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
      <div className="mb-6 flex items-center justify-between px-1">
        <h2 className="text-foreground text-lg font-bold">{monthYearText}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
            aria-label="이전 월"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleToday}
            className="text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors"
          >
            오늘
          </button>
          <button
            onClick={handleNextMonth}
            className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg p-2 transition-colors"
            aria-label="다음 월"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="mb-2 grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={index}
            className="text-muted-foreground py-2 text-center text-xs font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid auto-rows-fr grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(day.date)}
            className={`
              flex min-h-[80px] flex-col items-stretch justify-start overflow-hidden rounded-lg
              px-1 pt-1 transition-all duration-200
              ${day.densityColor}
              ${day.isCurrentMonth ? '' : 'opacity-40'}
              ${day.isToday ? 'ring-primary ring-offset-background ring-2 ring-offset-2' : ''}
              hover:ring-primary cursor-pointer
              hover:ring-2
            `}
          >
            {/* Day Number */}
            <span
              className={`
                mb-1 self-center text-xs font-semibold
                ${day.isToday ? 'text-primary' : day.eventCount > 5 ? 'text-white' : 'text-foreground'}
              `}
            >
              {day.dayNumber}
            </span>

            {/* Event Badges */}
            <div className="flex w-full flex-1 flex-col gap-1">
              {day.events.slice(0, 2).map((event, i) => (
                <span
                  key={i}
                  className="w-full truncate rounded border bg-white/50 px-1 py-0.5 text-left text-[10px] text-black backdrop-blur-sm dark:bg-black/30 dark:text-white"
                  style={{ borderColor: event.color }}
                  title={event.title}
                >
                  {event.title}
                </span>
              ))}
              {day.events.length > 2 && (
                <span className="-mt-1 text-center text-[10px] tracking-widest text-black/50 dark:text-white/50">
                  ...
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
