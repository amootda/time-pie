'use client'

import { toDateString } from '@time-pie/core'
import type { EventMonthMeta, Todo } from '@time-pie/supabase'
import { Calendar } from 'lucide-react'
import { EventListItem } from './EventListItem'
import { TodoListSection } from './TodoListSection'

interface DateEventsSectionProps {
  selectedDate: Date
  events: EventMonthMeta[]
  todos: Todo[]
  onEventClick: (event: EventMonthMeta) => void
}

export function DateEventsSection({
  selectedDate,
  events,
  todos,
  onEventClick,
}: DateEventsSectionProps) {
  const todayStr = toDateString()
  const isToday = toDateString(selectedDate) === todayStr

  // Filter out anchor events
  const displayEvents = events.filter((e) => e.event_type !== 'anchor')

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-3 flex items-center gap-2 dark:text-white text-lg">
        <Calendar className="w-5 h-5 text-primary" />
        <span>
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
        </span>
        {isToday && (
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium ml-1">오늘</span>
        )}
      </h3>

      {/* Events */}
      <div className="space-y-2">
        {displayEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center bg-card rounded-xl border border-border/50">
            일정이 없습니다
          </p>
        ) : (
          displayEvents.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
            />
          ))
        )}
      </div>

      {/* Todos */}
      <TodoListSection todos={todos} selectedDate={selectedDate} />
    </div>
  )
}
