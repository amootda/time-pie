'use client'

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
        return e.start_at.startsWith(dateStr)
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
        events: dateEvents
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
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-foreground text-lg font-bold">
          {monthYearText}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
            aria-label="이전 월"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-bold text-primary border border-primary/30 bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
          >
            오늘
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors"
            aria-label="다음 월"
          >
            <ChevronRight className="w-5 h-5" />
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
      <div className="grid grid-cols-7 gap-1 auto-rows-fr">
        {calendarDays.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(day.date)}
            className={`
              min-h-[80px] flex flex-col items-stretch justify-start pt-1 px-1
              rounded-lg transition-all duration-200 overflow-hidden
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
                text-xs font-semibold mb-1 self-center
                ${day.isToday ? 'text-primary' : day.eventCount > 5 ? 'text-white' : 'text-foreground'}
              `}
            >
              {day.dayNumber}
            </span>

            {/* Event Badges */}
            <div className="flex flex-col gap-1 w-full flex-1">
              {day.events.slice(0, 2).map((event, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-white/50 backdrop-blur-sm text-black dark:text-white dark:bg-black/30 px-1 py-0.5 rounded truncate text-left w-full"
                  title={event.title}
                >
                  {event.title}
                </span>
              ))}
              {day.events.length > 2 && (
                <span className="text-[10px] text-center text-black/50 dark:text-white/50 -mt-1 tracking-widest">
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
