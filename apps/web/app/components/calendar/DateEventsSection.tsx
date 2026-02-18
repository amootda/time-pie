'use client'

import Link from 'next/link'
import { toDateString } from '@time-pie/core'
import { EventListItem } from './EventListItem'
import { TodoListSection } from './TodoListSection'
import type { EventMonthMeta, Todo } from '@time-pie/supabase'

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

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-3 flex items-center gap-2 dark:text-white">
        <span>📅</span>
        {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
        {isToday && (
          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">오늘</span>
        )}
      </h3>

      {/* Events */}
      <div className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center bg-white dark:bg-gray-800 rounded-xl">
            일정이 없습니다
          </p>
        ) : (
          events.map((event) => (
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

      {/* Link to Pie View */}
      <Link
        href="/"
        className="mt-4 block text-center py-3 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors"
      >
        파이 차트로 보기 →
      </Link>
    </div>
  )
}
