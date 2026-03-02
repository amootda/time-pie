'use client'

import type { EventMonthMeta } from '@time-pie/supabase'
import dayjs from 'dayjs'
import { Anchor, ClipboardList } from 'lucide-react'
import { memo } from 'react'

// EventMonthMeta (캘린더용 경량 타입)와 Event (전체 타입) 모두 수용
// Event는 EventMonthMeta의 상위 집합이므로 자동으로 호환됨
type EventCardData = EventMonthMeta & { description?: string | null }

interface EventCardProps {
  event: EventCardData
  onClick?: () => void
  /** @deprecated 현재 미사용, 하위 호환성 유지용 */
  onStartExecution?: () => void
}

export const EventCard = memo(function EventCard({
  event,
  onClick,
}: EventCardProps) {
  const isAnchor = event.event_type === 'anchor'

  return (
    <button
      onClick={onClick}
      className="bg-card border-border/40 group flex w-full cursor-pointer items-center gap-0 overflow-hidden rounded-xl border border-l-4 p-0 text-left shadow-sm transition-all duration-200 hover:shadow-md"
      style={{ borderLeftColor: event.color }}
    >
      <div className="min-w-0 flex-1 px-4 py-3">
        <div className="mb-1 flex items-center gap-2">
          <p className="text-foreground group-hover:text-primary truncate text-sm font-semibold leading-tight transition-colors">
            {event.title}
          </p>
          <span
            className={`flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight ${
              isAnchor
                ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300'
                : 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300'
            }`}
          >
            {isAnchor ? (
              <>
                <Anchor className="h-2.5 w-2.5" /> 앵커
              </>
            ) : (
              <>
                <ClipboardList className="h-2.5 w-2.5" /> 할일
              </>
            )}
          </span>
        </div>
        {event.description && (
          <p className="text-muted-foreground mb-1 truncate text-xs">
            {event.description}
          </p>
        )}
        <p className="text-muted-foreground text-xs font-medium tabular-nums">
          {dayjs(event.start_at).format('HH:mm')} –{' '}
          {dayjs(event.end_at).format('HH:mm')}
        </p>
      </div>

      {/* 우측 시간 강조 (앵커 이벤트만) */}
      {isAnchor && (
        <div className="border-border/30 shrink-0 border-l px-4 py-3 text-right">
          <p
            className="text-lg font-bold tabular-nums"
            style={{ color: event.color }}
          >
            {dayjs(event.start_at).format('HH:mm')}
          </p>
          <p className="text-muted-foreground text-[11px] tabular-nums">
            {dayjs(event.end_at).format('HH:mm')}
          </p>
        </div>
      )}
    </button>
  )
})
