'use client'

import { getLocalTimeFromISO, toDateString, useCurrentTime } from '@time-pie/core'
import type { Event } from '@time-pie/supabase'
import { memo, useMemo } from 'react'
import { EventCard } from './EventCard'

interface TodayEventsSectionProps {
  sortedEvents: Event[]
  selectedDate: Date
  onEventClick: (event: Event) => void
  onStartExecution: (event: Event) => void
}

/**
 * TodayEventsSection — 선택된 날짜의 모든 일정을 현재 시간 기준으로 지난 일정과 예정된 일정으로 구분하여 표시
 * useCurrentTime()을 사용하여 1분마다 자동 업데이트
 */
export const TodayEventsSection = memo(function TodayEventsSection({
  sortedEvents,
  selectedDate,
  onEventClick,
  onStartExecution,
}: TodayEventsSectionProps) {
  // ⚡ 현재 시간 기반 필터링을 위해 useCurrentTime() 사용
  //    1분마다 이 컴포넌트만 리렌더링
  const currentTime = useCurrentTime()

  // 선택된 날짜 기준으로 지난 일정과 예정된 일정으로 분리
  const { pastEvents, futureEvents } = useMemo(() => {
    const past: Event[] = []
    const future: Event[] = []

    // 오늘 날짜와 선택된 날짜 비교
    const today = new Date()
    const todayStr = toDateString(today)
    const selectedDateStr = toDateString(selectedDate)

    // 선택된 날짜가 오늘보다 이전이면 모든 일정을 Past로
    if (selectedDateStr < todayStr) {
      return { pastEvents: sortedEvents, futureEvents: [] }
    }

    // 선택된 날짜가 오늘보다 미래면 모든 일정을 Future로
    if (selectedDateStr > todayStr) {
      return { pastEvents: [], futureEvents: sortedEvents }
    }

    // 선택된 날짜가 오늘이면 현재 시간으로 비교
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()

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
  }, [sortedEvents, selectedDate, currentTime])

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
