'use client'

import { getLocalTimeFromISO, useCurrentTime } from '@time-pie/core'
import type { Event } from '@time-pie/supabase'
import { memo, useMemo } from 'react'
import { EventCard } from './EventCard'

interface UpNextSectionProps {
  sortedEvents: Event[]
  onEventClick: (event: Event) => void
  onStartExecution: (event: Event) => void
}

/**
 * Up Next 섹션 — useCurrentTime()을 여기서만 사용합니다.
 * "현재 시간 이후" 이벤트 필터는 시간에 의존하지만,
 * 이 리렌더링이 부모 HomePage로 전파되지 않습니다.
 */
export const UpNextSection = memo(function UpNextSection({
  sortedEvents,
  onEventClick,
  onStartExecution,
}: UpNextSectionProps) {
  // ⚡ 현재 시간 기반 필터링을 위해 useCurrentTime() 사용
  //    1분마다 이 컴포넌트만 리렌더링
  const currentTime = useCurrentTime()

  const upcomingEvents = useMemo(() => {
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    return sortedEvents.filter((event) => {
      const startTime = getLocalTimeFromISO(event.start_at)
      const [hour, minute] = startTime.split(':').map(Number)
      return hour > currentHour || (hour === currentHour && minute > currentMinute)
    })
  }, [sortedEvents, currentTime])

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-foreground text-2xl font-bold">Up Next</h2>
        <span className="text-muted-foreground text-sm">
          {upcomingEvents.length} task{upcomingEvents.length !== 1 ? 's' : ''} remaining
        </span>
      </div>

      {upcomingEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No upcoming events</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
              onStartExecution={() => onStartExecution(event)}
            />
          ))}
        </div>
      )}
    </div>
  )
})
