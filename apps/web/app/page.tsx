'use client'

import {
    getLocalTimeFromISO,
    isSameLocalDate,
    toDateString,
    useCompleteExecutionMutation,
    useCreateEventMutation,
    useCreateExecutionMutation,
    useDeleteEventMutation,
    useEventsQuery,
    useEventStore,
    useExecutionStore,
    useSkipExecutionMutation,
    useUpdateEventMutation,
} from '@time-pie/core'
import type { Event, EventInsert } from '@time-pie/supabase'
import { getUserSettings } from '@time-pie/supabase'
import { Spinner } from '@time-pie/ui'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { BottomNav, ExecutionTimer, Header } from './components'
import { PieChartSection } from './components/PieChartSection'
import { TodayEventsSection } from './components/TodayEventsSection'
import { useAuth } from './providers'

const EventModal = dynamic(
  () => import('./components/EventModal').then((m) => ({ default: m.EventModal })),
  { loading: () => null }
)

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()

  // ✅ Zustand Selector: 필요한 값만 개별 구독
  const selectedDate = useEventStore((s) => s.selectedDate)
  const setSelectedDate = useEventStore((s) => s.setSelectedDate)
  const storeEvents = useEventStore((s) => s.events)
  const activeExecution = useExecutionStore((s) => s.activeExecution)

  // React Query hooks
  const { data: eventsData, isLoading: eventsLoading } = useEventsQuery(user?.id, selectedDate)
  const createEventMutation = useCreateEventMutation()
  const updateEventMutation = useUpdateEventMutation()
  const deleteEventMutation = useDeleteEventMutation()
  const createExecutionMutation = useCreateExecutionMutation()
  const completeExecutionMutation = useCompleteExecutionMutation()
  const skipExecutionMutation = useSkipExecutionMutation()

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Load notification settings
  useEffect(() => {
    if (!user?.id) return
    getUserSettings(user.id).then((settings) => {
      if (settings) setNotificationsEnabled(settings.notifications_events)
    }).catch(console.error)
  }, [user?.id])

  // Use API data if available, otherwise fallback to store
  const events = eventsData ?? storeEvents
  const isLoading = eventsLoading || createEventMutation.isPending || updateEventMutation.isPending || deleteEventMutation.isPending

  // Filter events for selected date
  const todayEvents = useMemo(() => {
    const selectedDayOfWeek = selectedDate.getDay()
    const todayStr = toDateString(selectedDate)
    return events.filter((e) => {
      if (e.event_type === 'anchor') {
        if (e.repeat_days && e.repeat_days.length > 0) {
          return e.repeat_days.includes(selectedDayOfWeek)
        }
        return isSameLocalDate(e.start_at, todayStr)
      }
      if (e.repeat_days && e.repeat_days.length > 0) {
        return e.repeat_days.includes(selectedDayOfWeek)
      }
      return isSameLocalDate(e.start_at, todayStr)
    })
  }, [events, selectedDate])

  // Sort events by start time
  const sortedEvents = useMemo(
    () =>
      [...todayEvents].sort((a, b) => {
        const timeA = getLocalTimeFromISO(a.start_at)
        const timeB = getLocalTimeFromISO(b.start_at)
        return timeA.localeCompare(timeB)
      }),
    [todayEvents]
  )

  // Convert to pie chart format
  const pieEvents = useMemo(
    () =>
      todayEvents.map((e) => {
        const isRecurring = e.repeat_days && e.repeat_days.length > 0

        if (isRecurring) {
          const startTime = getLocalTimeFromISO(e.start_at, 'HH:mm:ss')

          let endTime: string
          if (e.event_type === 'anchor' && e.base_time && e.target_duration_min) {
            const [hours, minutes] = e.base_time.split(':').map(Number)
            const totalMinutes = hours * 60 + minutes + e.target_duration_min
            const endHours = Math.floor(totalMinutes / 60) % 24
            const endMinutes = totalMinutes % 60
            endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`
          } else {
            endTime = getLocalTimeFromISO(e.end_at, 'HH:mm:ss')
          }

          const selectedDateStr = toDateString(selectedDate)
          return {
            ...e,
            start_at: `${selectedDateStr}T${startTime}`,
            end_at: `${selectedDateStr}T${endTime}`,
          }
        }
        return e
      }),
    [todayEvents, selectedDate]
  )

  // Handlers
  const handleAddEvent = useCallback(
    async (event: Omit<EventInsert, 'user_id'>) => {
      if (!user) return
      if (selectedEvent) {
        await updateEventMutation.mutateAsync({ id: selectedEvent.id, updates: event })
      } else {
        await createEventMutation.mutateAsync({ ...event, user_id: user.id })
      }
      setSelectedEvent(undefined)
    },
    [user, selectedEvent, updateEventMutation, createEventMutation]
  )

  const handleDeleteEvent = useCallback(
    async (eventId: string) => {
      try {
        await deleteEventMutation.mutateAsync(eventId)
        setEventModalOpen(false)
        setSelectedEvent(undefined)
      } catch (error) {
        console.error('Failed to delete event:', error)
      }
    },
    [deleteEventMutation]
  )

  const handleStartExecution = useCallback(
    async (event: Event) => {
      if (!user) return
      try {
        const dateStr = toDateString(selectedDate)
        // 선택된 날짜 + 이벤트의 시간을 조합하여 planned_start/planned_end 생성
        const startTime = getLocalTimeFromISO(event.start_at, 'HH:mm:ss')
        const endTime = getLocalTimeFromISO(event.end_at, 'HH:mm:ss')
        const plannedStart = `${dateStr}T${startTime}`

        // overnight 이벤트 처리: endTime이 startTime보다 이전이면 다음 날로 설정
        let plannedEnd: string
        if (endTime <= startTime) {
          const nextDay = new Date(selectedDate)
          nextDay.setDate(nextDay.getDate() + 1)
          const nextDayStr = toDateString(nextDay)
          plannedEnd = `${nextDayStr}T${endTime}`
        } else {
          plannedEnd = `${dateStr}T${endTime}`
        }

        await createExecutionMutation.mutateAsync({
          event_id: event.id,
          user_id: user.id,
          planned_start: plannedStart,
          planned_end: plannedEnd,
          actual_start: new Date().toISOString(),
          actual_end: null,
          status: 'in_progress',
          completion_rate: 0,
          date: dateStr,
          notes: null,
        })
      } catch (error) {
        console.error('Failed to start execution:', error)
      }
    },
    [user, selectedDate, createExecutionMutation]
  )

  const handleStopExecution = useCallback(async () => {
    if (!activeExecution) return
    try {
      await completeExecutionMutation.mutateAsync(activeExecution.id)
    } catch (error) {
      console.error('Failed to stop execution:', error)
    }
  }, [activeExecution, completeExecutionMutation])

  const handleSkipExecution = useCallback(async () => {
    if (!activeExecution) return
    try {
      await skipExecutionMutation.mutateAsync(activeExecution.id)
    } catch (error) {
      console.error('Failed to skip execution:', error)
    }
  }, [activeExecution, skipExecutionMutation])

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event)
    setEventModalOpen(true)
  }, [])

  const handleTimeSlotClick = useCallback(() => {
    setEventModalOpen(true)
  }, [])

  // Get event title for active execution
  const activeEventTitle = useMemo(
    () =>
      activeExecution
        ? todayEvents.find((e) => e.id === activeExecution.event_id)?.title || 'Unknown Event'
        : '',
    [activeExecution, todayEvents]
  )

  // Loading state
  if (authLoading) {
    return <Spinner size="lg" fullScreen />
  }

  return (
    <>
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        {/* Header stays at the top */}
        <Header
          showDate
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Main content area scrolls internally */}
        <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto px-6 py-6 pb-24 no-scrollbar">
          {/* ⚡ PieChart — useCurrentTime은 이 컴포넌트 내부에서만 사용 */}
          <PieChartSection
            pieEvents={pieEvents}
            todayEvents={todayEvents}
            selectedDate={selectedDate}
            isLoading={isLoading}
            notificationsEnabled={notificationsEnabled}
            sortedEvents={sortedEvents}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
          />

          {/* ⚡ 오늘의 일정 — 현재 시간 기준으로 지난 일정과 예정된 일정으로 구분 */}
          <TodayEventsSection
            sortedEvents={sortedEvents}
            selectedDate={selectedDate}
            onEventClick={handleEventClick}
            onStartExecution={handleStartExecution}
          />
        </main>

        {/* Execution Timer */}
        {activeExecution && (
          <ExecutionTimer
            eventTitle={activeEventTitle}
            startTime={new Date(activeExecution.actual_start || activeExecution.planned_start)}
            onStop={handleStopExecution}
            onSkip={handleSkipExecution}
          />
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Modals - Moved outside fixed container for backdrop blur */}
      <EventModal
        isOpen={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false)
          setSelectedEvent(undefined)
        }}
        onSave={handleAddEvent}
        onDelete={handleDeleteEvent}
        selectedDate={selectedDate}
        initialData={selectedEvent}
      />
    </>
  )
}
