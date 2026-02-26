'use client'

import { getLocalTimeFromISO, useCurrentTime } from '@time-pie/core'
import type { Event } from '@time-pie/supabase'
import { memo, useMemo } from 'react'
import { EventCard } from './EventCard'

interface TodayEventsSectionProps {
  sortedEvents: Event[]
  onEventClick: (event: Event) => void
  onStartExecution: (event: Event) => void
}

/**
 * TodayEventsSection — 오늘의 모든 일정을 현재 시간 기준으로 지난 일정과 예정된 일정으로 구분하여 표시
 * useCurrentTime()을 사용하여 1분마다 자동 업데이트
 */
export const TodayEventsSection = memo(function TodayEventsSection({
  sortedEvents,
  onEventClick,
  onStartExecution,
}: TodayEventsSectionProps) {
  // ⚡ 현재 시간 기반 필터링을 위해 useCurrentTime() 사용
  //    1분마다 이 컴포넌트만 리렌더링
  const currentTime = useCurrentTime()

  // 현재 시간 기준으로 지난 일정과 예정된 일정으로 분리
  const { pastEvents, futureEvents } = useMemo(() => {
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()

    const past: Event[] = []
    const future: Event[] = []

    sortedEvents.forEach((event) => {
      const startTime = getLocalTimeFromISO(event.start_at)
      const [hour, minute] = startTime.split(':').map(Number)

      // 시작 시간이 현재 시간 이하면 지난 일정 (이미 시작된 일정)
      if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
        past.push(event)
      } else {
        future.push(event)
      }
    })

    return { pastEvents: past, futureEvents: future }
  }, [sortedEvents, currentTime])

  return (
    <div className="mb-6 space-y-8">
      {/* 지난 일정 섹션 */}
      {pastEvents.length > 0 && (
        <div role="region" aria-label="Past Events">
          <div className="flex items-center justify-between mb-4">
            <h2 id="past-events-heading" className="text-muted-foreground text-2xl font-bold">
              Past
            </h2>
            <span
              className="text-muted-foreground text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              {pastEvents.length} completed
            </span>
          </div>
          <div aria-labelledby="past-events-heading" className="space-y-3">
            {pastEvents.map((event) => (
              <div key={event.id} className="opacity-60">
                <EventCard
                  event={event}
                  onClick={() => onEventClick(event)}
                  // 지난 일정에는 시작 버튼 없음
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예정된 일정 섹션 */}
      <div role="region" aria-label="Upcoming Events">
        <div className="flex items-center justify-between mb-4">
          <h2 id="upcoming-events-heading" className="text-foreground text-2xl font-bold">
            Upcoming
          </h2>
          <span
            className="text-muted-foreground text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {futureEvents.length} remaining
          </span>
        </div>

        <div aria-labelledby="upcoming-events-heading">
          {futureEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No upcoming events today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {futureEvents.map((event) => (
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
      </div>
    </div>
  )
})
