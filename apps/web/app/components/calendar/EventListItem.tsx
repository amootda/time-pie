'use client'

import type { EventMonthMeta } from '@time-pie/supabase'

interface EventListItemProps {
  event: EventMonthMeta
  onClick: () => void
}

export function EventListItem({ event, onClick }: EventListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
    >
      <div
        className="w-1 h-12 rounded-full"
        style={{ backgroundColor: event.color }}
      />
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <p className="font-medium dark:text-white">{event.title}</p>
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              event.event_type === 'anchor'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : event.event_type === 'soft'
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                  : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            }`}
          >
            {event.event_type === 'anchor' ? '⚓ 앵커' : event.event_type === 'soft' ? '☁️ 소프트' : '🔒 하드'}
          </span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {event.start_at.split('T')[1].slice(0, 5)} -{' '}
          {event.end_at.split('T')[1].slice(0, 5)}
        </p>
      </div>
    </button>
  )
}
