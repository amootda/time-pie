'use client'

import type { EventMonthMeta } from '@time-pie/supabase'
import dayjs from 'dayjs'
import { Anchor, ClipboardList } from 'lucide-react'

interface EventListItemProps {
  event: EventMonthMeta
  onClick: () => void
}

export function EventListItem({ event, onClick }: EventListItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-card rounded-xl shadow-sm border border-border/50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
    >
      <div
        className="w-1.5 h-12 rounded-full"
        style={{ backgroundColor: event.color }}
      />
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{event.title}</p>
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 uppercase tracking-tight ${event.event_type === 'anchor'
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              }`}
          >
            {event.event_type === 'anchor' ? (
              <><Anchor className="w-3 h-3" /> 앵커</>
            ) : (
              <><ClipboardList className="w-3 h-3" /> 할일</>
            )}
          </span>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          {dayjs(event.start_at).format('HH:mm')} -{' '}
          {dayjs(event.end_at).format('HH:mm')}
        </p>
      </div>
    </button>
  )
}
