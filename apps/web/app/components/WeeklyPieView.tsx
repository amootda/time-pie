'use client'

import { useMemo } from 'react'
import { PieChart } from '@time-pie/ui'
import type { Event, EventMonthMeta } from '@time-pie/supabase'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

interface WeeklyPieViewProps {
  events: (Event | EventMonthMeta)[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

interface DayData {
  date: Date
  dayOfWeek: number
  dayLabel: string
  dayEvents: (Event | EventMonthMeta)[]
  eventCount: number
  isToday: boolean
}

export function WeeklyPieView({ events, selectedDate, onDateSelect }: WeeklyPieViewProps) {
  // Get week start (Monday) and week end (Sunday)
  const weekStart = useMemo(() => dayjs(selectedDate).startOf('isoWeek').toDate(), [selectedDate])
  const weekEnd = useMemo(() => dayjs(selectedDate).endOf('isoWeek').toDate(), [selectedDate])

  // Get today for highlighting (recalculates on selectedDate change to handle midnight crossover)
  const today = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  }, [selectedDate])

  // Generate 7 days data (Mon-Sun)
  const weekDays = useMemo((): DayData[] => {
    const days: DayData[] = []
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일']

    for (let i = 0; i < 7; i++) {
      const date = dayjs(weekStart).add(i, 'day').toDate()
      const dayOfWeek = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

      // Filter events for this day
      const dayEvents = events.filter((e) => {
        const dateStr = dayjs(date).format('YYYY-MM-DD')

        // Anchor events: repeat_days check or one-time event
        if (e.event_type === 'anchor') {
          if (e.repeat_days && e.repeat_days.length > 0) {
            return e.repeat_days.includes(dayOfWeek)
          }
          return e.start_at.startsWith(dateStr)
        }

        // Hard events: repeat_days check or one-time event
        if (e.event_type === 'hard') {
          if (!e.repeat_days || e.repeat_days.length === 0) {
            return e.start_at.startsWith(dateStr)
          }
          return e.repeat_days.includes(dayOfWeek)
        }

        // Soft events: repeat_days check or one-time event
        if (e.event_type === 'soft') {
          if (e.repeat_days && e.repeat_days.length > 0) {
            return e.repeat_days.includes(dayOfWeek)
          }
          return e.start_at.startsWith(dateStr)
        }

        // Fallback
        return e.start_at.startsWith(dateStr)
      })

      // Convert events to selected date format for PieChart
      const pieEvents = dayEvents.map((e) => {
        const isRecurring = e.event_type === 'anchor' || e.event_type === 'soft' || (e.event_type === 'hard' && e.repeat_days && e.repeat_days.length > 0)

        if (isRecurring) {
          // Extract time portion from stored timestamp
          const startTime = e.start_at.split('T')[1] || '00:00:00'

          // For anchor events, calculate end time from base_time + target_duration_min
          let endTime: string
          if (e.event_type === 'anchor' && 'base_time' in e && e.base_time && 'target_duration_min' in e && e.target_duration_min) {
            const [hours, minutes] = e.base_time.split(':').map(Number)
            const totalMinutes = hours * 60 + minutes + e.target_duration_min
            const endHours = Math.floor(totalMinutes / 60) % 24
            const endMinutes = totalMinutes % 60
            endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`
          } else {
            endTime = e.end_at.split('T')[1] || '23:59:59'
          }

          // Apply to this day's date
          const dateStr = dayjs(date).format('YYYY-MM-DD')

          return {
            ...e,
            start_at: `${dateStr}T${startTime}`,
            end_at: `${dateStr}T${endTime}`,
          }
        }

        // Non-recurring hard events: return as-is
        return e
      })

      // Check if this is today
      const dateOnly = new Date(date)
      dateOnly.setHours(0, 0, 0, 0)
      const isToday = dateOnly.getTime() === today.getTime()

      days.push({
        date,
        dayOfWeek,
        dayLabel: dayLabels[i],
        dayEvents: pieEvents,
        eventCount: dayEvents.length,
        isToday,
      })
    }

    return days
  }, [weekStart, events, today])

  // Format week range display
  const weekRangeText = useMemo(() => {
    const start = dayjs(weekStart)
    const end = dayjs(weekEnd)

    if (start.month() === end.month()) {
      return `${start.format('M월 D일')} - ${end.format('D일')}`
    }
    return `${start.format('M월 D일')} - ${end.format('M월 D일')}`
  }, [weekStart, weekEnd])

  const handleThisWeek = () => {
    onDateSelect(new Date())
  }

  return (
    <div className="w-full">
      {/* Week Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-foreground text-lg font-semibold">
          {weekRangeText}
        </h2>
        <button
          onClick={handleThisWeek}
          className="px-3 py-1.5 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors"
        >
          이번 주
        </button>
      </div>

      {/* 7-Day Grid */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, index) => (
          <div
            key={index}
            onClick={() => onDateSelect(day.date)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onDateSelect(day.date)
              }
            }}
            tabIndex={0}
            role="button"
            aria-label={`${day.dayLabel}요일 ${dayjs(day.date).format('M월 D일')} 선택`}
            className={`
              flex flex-col items-center cursor-pointer
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:rounded-xl
              ${day.isToday ? 'ring-2 ring-primary rounded-xl p-2 -m-2' : ''}
            `}
          >
            {/* Day Label */}
            <div className="text-xs font-medium text-muted-foreground mb-2">
              {day.dayLabel}
            </div>

            {/* Date */}
            <div className={`text-xs mb-3 ${day.isToday ? 'text-primary font-bold' : 'text-foreground'}`}>
              {dayjs(day.date).format('D')}
            </div>

            {/* Mini Pie Chart */}
            <div className="relative hover:scale-110 transition-transform duration-200">
              {day.dayEvents.length > 0 ? (
                <PieChart
                  events={day.dayEvents}
                  currentTime={day.isToday ? today : undefined}
                  selectedDate={day.date}
                  size={80}
                  showLabels={false}
                  showCurrentTime={day.isToday}
                  className="pointer-events-none"
                />
              ) : (
                // Empty state
                <div className="w-[80px] h-[80px] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                    <span className="text-muted-foreground/50 text-xs">비어있음</span>
                  </div>
                </div>
              )}
            </div>

            {/* Event Count */}
            <div className="text-xs text-muted-foreground mt-3">
              {day.eventCount > 0 ? `${day.eventCount}개` : '-'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
