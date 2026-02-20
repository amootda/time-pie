'use client'

import { isSameLocalDate, toDateString, useCreateEventMutation, useDeleteEventMutation, useEventStore, useMonthEvents, useTodoStore, useUIStore, useUpdateEventMutation } from '@time-pie/core'
import type { Event, EventInsert, EventMonthMeta } from '@time-pie/supabase'
import { getEventById } from '@time-pie/supabase'
import { useState } from 'react'
import {
  BottomNav,
  CalendarView,
  DateEventsSection,
  EventModal,
  FloatingAddButton,
  Header
} from '../components'
import { useAuth } from '../providers'

export default function CalendarPage() {
  const { user } = useAuth()
  const { events: storeEvents, selectedDate, setSelectedDate } = useEventStore()
  const { todos } = useTodoStore()
  const { calendarViewMode: viewMode, setCalendarViewMode: setViewMode } = useUIStore()
  const createEventMutation = useCreateEventMutation()
  const updateEventMutation = useUpdateEventMutation()
  const deleteEventMutation = useDeleteEventMutation()

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

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
    return todos.filter((t) => t.due_date === dateStr)
  }

  const handleSaveEvent = async (event: Omit<EventInsert, 'user_id'>) => {
    if (!user) return

    if (selectedEvent?.id) {
      // Update existing event
      await updateEventMutation.mutateAsync({
        id: selectedEvent.id,
        updates: event,
      })
    } else {
      // Create new event
      await createEventMutation.mutateAsync({ ...event, user_id: user.id })
    }

    setSelectedEvent(null)
  }

  const handleDeleteEvent = async (id: string) => {
    await deleteEventMutation.mutateAsync(id)
    setSelectedEvent(null)
    setEventModalOpen(false)
  }

  const handleOpenEventModal = async (event?: Event | EventMonthMeta) => {
    if (!event) {
      // New event
      setSelectedEvent(null)
      setEventModalOpen(true)
      return
    }

    // If event is EventMonthMeta (from month view), fetch full Event
    const isMonthMeta = !('description' in event)
    if (isMonthMeta) {
      try {
        const fullEvent = await getEventById(event.id)
        if (fullEvent) {
          setSelectedEvent(fullEvent)
          setEventModalOpen(true)
        }
      } catch (error) {
        console.error('Failed to fetch event details:', error)
      }
    } else {
      // Already a full Event
      setSelectedEvent(event as Event)
      setEventModalOpen(true)
    }
  }

  const handleCloseEventModal = () => {
    setEventModalOpen(false)
    setSelectedEvent(null)
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pb-20">
      <Header title="캘린더" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* <CalendarViewToggle viewMode={viewMode} onViewModeChange={setViewMode} /> */}

        <CalendarView
          viewMode={viewMode}
          events={monthEventsData?.events ?? storeEvents}
          selectedDate={selectedDate}
          currentMonth={currentMonth}
          onDateSelect={setSelectedDate}
          onMonthChange={setCurrentMonth}
        />

        <DateEventsSection
          selectedDate={selectedDate}
          events={getEventsForDate(selectedDate)}
          todos={getTodosForDate(selectedDate)}
          onEventClick={handleOpenEventModal}
        />
      </main>

      <FloatingAddButton onAddEvent={() => handleOpenEventModal()} />
      <BottomNav />

      <EventModal
        isOpen={eventModalOpen}
        onClose={handleCloseEventModal}
        onSave={handleSaveEvent}
        onDelete={selectedEvent ? handleDeleteEvent : undefined}
        initialData={selectedEvent || undefined}
        selectedDate={selectedDate}
      />
    </div>
  )
}
