'use client'

import { useState } from 'react'
import { PieChart, Spinner } from '@time-pie/ui'
import { useEventStore, useCurrentTime, useUserData, useExecutionStore } from '@time-pie/core'
import { Header, FloatingAddButton, EventModal, EventCard, ExecutionTimer, BottomNav } from './components'
import type { Event, EventInsert } from '@time-pie/supabase'
import { useAuth } from './providers'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const currentTime = useCurrentTime()
  const { events, selectedDate, setSelectedDate } = useEventStore()
  const { activeExecution } = useExecutionStore()

  const {
    isLoading,
    createEvent,
    updateEvent,
    removeEvent,
    startEventExecution,
    completeEventExecution,
    skipEventExecution,
  } = useUserData(user?.id)

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined)

  // Filter events for selected date
  const selectedDayOfWeek = selectedDate.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  const todayEvents = events.filter((e) => {
    const todayStr = selectedDate.toISOString().split('T')[0]
    // Anchor events: always show (daily)
    if (e.event_type === 'anchor') return true
    // Hard events: show if no repeat_days set (one-time) OR if today's day is in repeat_days
    if (e.event_type === 'hard') {
      if (!e.repeat_days || e.repeat_days.length === 0) {
        return e.start_at.startsWith(todayStr)
      }
      return e.repeat_days.includes(selectedDayOfWeek)
    }
    // Soft events: always show (goal-based)
    if (e.event_type === 'soft') return true
    // Fallback
    return e.start_at.startsWith(todayStr)
  })

  // Sort events by start time
  const sortedEvents = [...todayEvents].sort((a, b) => {
    const timeA = a.start_at.split('T')[1] || '00:00'
    const timeB = b.start_at.split('T')[1] || '00:00'
    return timeA.localeCompare(timeB)
  })

  // Get upcoming events (현재 시간 이후의 이벤트들)
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const upcomingEvents = sortedEvents.filter((event) => {
    const startTime = event.start_at.split('T')[1]?.slice(0, 5) || '00:00'
    const [hour, minute] = startTime.split(':').map(Number)
    return hour > currentHour || (hour === currentHour && minute > currentMinute)
  })

  // Convert to pie chart format
  // For anchor/soft events, extract time and apply to selectedDate
  const pieEvents = todayEvents.map((e) => {
    const isRecurring = e.event_type === 'anchor' || e.event_type === 'soft'

    if (isRecurring) {
      // Extract time portion from stored timestamp
      const startTime = e.start_at.split('T')[1] || '00:00:00'

      // For anchor events, calculate end time from base_time + target_duration_min
      let endTime: string
      if (e.event_type === 'anchor' && e.base_time && e.target_duration_min) {
        const [hours, minutes] = e.base_time.split(':').map(Number)
        const totalMinutes = hours * 60 + minutes + e.target_duration_min
        const endHours = Math.floor(totalMinutes / 60) % 24
        const endMinutes = totalMinutes % 60
        endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00`
      } else {
        endTime = e.end_at.split('T')[1] || '23:59:59'
      }

      // Apply to selected date
      const selectedDateStr = selectedDate.toISOString().split('T')[0]

      // Return full Event object with updated timestamps
      return {
        ...e,
        start_at: `${selectedDateStr}T${startTime}`,
        end_at: `${selectedDateStr}T${endTime}`,
      }
    }

    // Hard events: return complete object as-is
    return e
  })


  const handleAddEvent = async (event: Omit<EventInsert, 'user_id'>) => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, event)
    } else {
      await createEvent(event)
    }
    setSelectedEvent(undefined)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await removeEvent(eventId)
      setEventModalOpen(false)
      setSelectedEvent(undefined)
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  const handleStartExecution = async (event: Event) => {
    try {
      await startEventExecution(event.id, event.start_at, event.end_at)
    } catch (error) {
      console.error('Failed to start execution:', error)
    }
  }

  const handleStopExecution = async () => {
    if (!activeExecution) return
    try {
      await completeEventExecution(activeExecution.id)
    } catch (error) {
      console.error('Failed to stop execution:', error)
    }
  }

  const handleSkipExecution = async () => {
    if (!activeExecution) return
    try {
      await skipEventExecution(activeExecution.id)
    } catch (error) {
      console.error('Failed to skip execution:', error)
    }
  }

  // Get event title for active execution
  const activeEventTitle = activeExecution
    ? todayEvents.find(e => e.id === activeExecution.event_id)?.title || 'Unknown Event'
    : ''

  // Loading state
  if (authLoading) {
    return <Spinner size="lg" fullScreen />
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header
        showDate
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <main className="max-w-lg mx-auto px-6 py-6">
        {/* 파이 차트 */}
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
            onEventClick={(pieEvent) => {
              const event = todayEvents.find((e) => e.id === pieEvent.id)
              if (event) {
                setSelectedEvent(event)
                setEventModalOpen(true)
              }
            }}
            onTimeSlotClick={() => {
              setEventModalOpen(true)
            }}
          />
        </div>

        {/* Up Next 섹션 */}
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
                  onClick={() => {
                    setSelectedEvent(event)
                    setEventModalOpen(true)
                  }}
                  onStartExecution={() => handleStartExecution(event)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <FloatingAddButton
        onAddEvent={() => setEventModalOpen(true)}
        onAddTodo={() => {}}
        onAddHabit={() => {}}
      />

      {/* Execution Timer */}
      {activeExecution && (
        <ExecutionTimer
          eventTitle={activeEventTitle}
          startTime={new Date(activeExecution.actual_start || activeExecution.planned_start)}
          onStop={handleStopExecution}
          onSkip={handleSkipExecution}
        />
      )}

      {/* Modals */}
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

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
