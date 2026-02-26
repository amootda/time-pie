'use client'

import { useAlarm, useCurrentTime } from '@time-pie/core'
import type { Event } from '@time-pie/supabase'
import { PieChart, Spinner } from '@time-pie/ui'
import { memo, useCallback } from 'react'

interface PieChartSectionProps {
  pieEvents: Event[]
  todayEvents: Event[]
  selectedDate: Date
  isLoading: boolean
  notificationsEnabled: boolean
  sortedEvents: Event[]
  onEventClick: (event: Event) => void
  onTimeSlotClick: () => void
}

/**
 * PieChart 영역 — useCurrentTime()을 여기서만 사용합니다.
 * 1분마다 리렌더링이 이 컴포넌트에만 격리됩니다.
 */
export const PieChartSection = memo(function PieChartSection({
  pieEvents,
  todayEvents,
  selectedDate,
  isLoading,
  notificationsEnabled,
  sortedEvents,
  onEventClick,
  onTimeSlotClick,
}: PieChartSectionProps) {
  // ⚡ useCurrentTime()이 여기서만 사용되므로,
  //    1분마다 리렌더링 범위가 이 컴포넌트로 한정됩니다.
  const currentTime = useCurrentTime()

  // Alarm scheduling (시간 기반이므로 PieChart와 함께)
  useAlarm({
    events: sortedEvents,
    enabled: notificationsEnabled,
    selectedDate,
  })

  const handlePieEventClick = useCallback(
    (pieEvent: { id: string }) => {
      const event = todayEvents.find((e) => e.id === pieEvent.id)
      if (event) {
        onEventClick(event)
      }
    },
    [todayEvents, onEventClick]
  )

  return (
    <div className="relative flex flex-col items-center mb-8">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 rounded-xl backdrop-blur-sm">
          <Spinner size="md" />
        </div>
      )}
      <PieChart
        events={pieEvents}
        currentTime={currentTime}
        selectedDate={selectedDate}
        size={320}
        showLabels
        showCurrentTime
        onEventClick={handlePieEventClick}
        onTimeSlotClick={onTimeSlotClick}
      />
    </div>
  )
})
