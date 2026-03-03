'use client'

import { useAlarm, useCurrentTime } from '@time-pie/core'
import type { Event } from '@time-pie/supabase'
import { PieChart, Spinner } from '@time-pie/ui'
import { memo, useCallback, useState } from 'react'

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

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const handlePieEventClick = useCallback(
    (pieEvent: { id: string }) => {
      const event = todayEvents.find((e) => e.id === pieEvent.id)
      if (event) {
        onEventClick(event)
      }
    },
    [todayEvents, onEventClick]
  )

  const handleSliceSelect = useCallback(
    (pieEvent: { id: string } | null) => {
      if (!pieEvent) {
        setSelectedEvent(null)
        return
      }
      const event = todayEvents.find((e) => e.id === pieEvent.id)
      setSelectedEvent(event ?? null)
    },
    [todayEvents]
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
        onSliceSelect={handleSliceSelect}
      />

      {/* 모바일 터치: 선택된 이벤트 정보 패널 */}
      {selectedEvent && (
        <div className="mt-2 w-full max-w-xs rounded-xl border border-border bg-popover/95 px-4 py-3 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div
                className="h-3 w-3 shrink-0 rounded-full shadow-sm"
                style={{ backgroundColor: selectedEvent.color }}
              />
              <span className="truncate font-semibold leading-none">
                {selectedEvent.title}
              </span>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-muted-foreground hover:text-foreground shrink-0 text-lg leading-none"
              aria-label="닫기"
            >
              ×
            </button>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {new Date(selectedEvent.start_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}{' '}
            -{' '}
            {new Date(selectedEvent.end_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </p>
          <button
            onClick={() => {
              onEventClick(selectedEvent)
              setSelectedEvent(null)
            }}
            className="mt-3 w-full rounded-lg bg-primary/10 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
          >
            편집
          </button>
        </div>
      )}
    </div>
  )
})
