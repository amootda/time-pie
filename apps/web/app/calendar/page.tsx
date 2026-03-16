'use client'

import { isSameLocalDate, toDateString, useEventData, useEventStore, useMonthEvents, useTodosQuery, useUIStore } from '@time-pie/core'
import type { Event, EventInsert, EventMonthMeta } from '@time-pie/supabase'
import { getEventById } from '@time-pie/supabase'
import { useState } from 'react'
import {
    BottomNav,
    CalendarView,
    DateEventsSection,
    EventDetailModal,
    EventModal,
    FloatingAddButton,
    Header
} from '../components'
import { useAuth } from '../providers'

export default function CalendarPage() {
  const { user } = useAuth()
  // ✅ Zustand Selector: 필요한 값만 개별 구독
  const storeEvents = useEventStore((s) => s.events)
  const selectedDate = useEventStore((s) => s.selectedDate)
  const setSelectedDate = useEventStore((s) => s.setSelectedDate)
  const { data: todosData } = useTodosQuery(user?.id)
  const viewMode = useUIStore((s) => s.calendarViewMode)
  const setViewMode = useUIStore((s) => s.setCalendarViewMode)
  const weekStartDay = useUIStore((s) => s.weekStartDay)
  const setWeekStartDay = useUIStore((s) => s.setWeekStartDay)
  const { createEvent, updateEvent, removeEvent } = useEventData(user?.id)

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailEvent, setDetailEvent] = useState<Event | null>(null)

  // Load month events with React Query
  const { data: monthEventsData, isLoading: isLoadingMonth } = useMonthEvents(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1
  )

  const todayStr = toDateString()

  const getEventsForDate = (date: Date) => {
    const dateStr = toDateString(date)
    const dayOfWeek = date.getDay() // 0=일, 1=월, ..., 6=토
    const eventsToUse = monthEventsData?.events ?? storeEvents

    return eventsToUse.filter((e) => {
      // Anchor: repeat_days가 설정되어 있으면 해당 요일만, 없으면 일회성
      if (e.event_type === 'anchor') {
        if (e.repeat_days && e.repeat_days.length > 0) {
          return e.repeat_days.includes(dayOfWeek)
        }
        return isSameLocalDate(e.start_at, dateStr)
      }

      // Task: repeat_days 체크, 없으면 일회성
      if (e.repeat_days && e.repeat_days.length > 0) {
        return e.repeat_days.includes(dayOfWeek)
      }
      return isSameLocalDate(e.start_at, dateStr)
    })
  }

  const getTodosForDate = (date: Date) => {
    const dateStr = toDateString(date)
    return (todosData ?? []).filter((t) => t.due_date === dateStr)
  }

  const handleSaveEvent = async (event: Omit<EventInsert, 'user_id'>) => {
    if (!user) return

    if (selectedEvent?.id) {
      // Update existing event
      await updateEvent(selectedEvent.id, event)
    } else {
      // Create new event
      await createEvent(event)
    }

    setSelectedEvent(null)
  }

  const handleDeleteEvent = async (id: string) => {
    await removeEvent(id)
    setSelectedEvent(null)
    setEventModalOpen(false)
    setDetailEvent(null)
    setDetailModalOpen(false)
  }

  // 이벤트 카드 클릭 → 상세 모달 열기
  const handleOpenDetailModal = async (event: Event | EventMonthMeta) => {
    const isMonthMeta = !('description' in event)
    if (isMonthMeta) {
      try {
        const fullEvent = await getEventById(event.id)
        if (fullEvent) {
          setDetailEvent(fullEvent)
          setDetailModalOpen(true)
        }
      } catch (error) {
        console.error('Failed to fetch event details:', error)
      }
    } else {
      setDetailEvent(event as Event)
      setDetailModalOpen(true)
    }
  }

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false)
    setDetailEvent(null)
  }

  // 상세 모달 → 수정 버튼 클릭
  const handleEditFromDetail = () => {
    setDetailModalOpen(false)
    setSelectedEvent(detailEvent)
    setEventModalOpen(true)
  }

  // "+" 버튼 → 신규 생성 모달
  const handleOpenEventModal = () => {
    setSelectedEvent(null)
    setEventModalOpen(true)
  }

  const handleCloseEventModal = () => {
    setEventModalOpen(false)
    setSelectedEvent(null)
  }

  return (
    <>
      <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
        <Header title="캘린더" />

        <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto px-4 py-4 pb-24 no-scrollbar">
          {/* <CalendarViewToggle viewMode={viewMode} onViewModeChange={setViewMode} /> */}

          <CalendarView
            viewMode={viewMode}
            events={monthEventsData?.events ?? storeEvents}
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onDateSelect={setSelectedDate}
            onMonthChange={setCurrentMonth}
            weekStartDay={weekStartDay}
            onWeekStartDayChange={setWeekStartDay}
          />

          <DateEventsSection
            selectedDate={selectedDate}
            events={getEventsForDate(selectedDate)}
            todos={getTodosForDate(selectedDate)}
            onEventClick={handleOpenDetailModal}
          />
        </main>

        <FloatingAddButton onAddEvent={handleOpenEventModal} />
        <BottomNav />
      </div>

      <EventDetailModal
        isOpen={detailModalOpen}
        event={detailEvent}
        onClose={handleCloseDetailModal}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteEvent}
      />

      <EventModal
        isOpen={eventModalOpen}
        onClose={handleCloseEventModal}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        initialData={selectedEvent || undefined}
        selectedDate={selectedDate}
      />
    </>
  )
}
