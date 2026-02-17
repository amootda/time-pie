'use client'

import { useState, useMemo } from 'react'
import { useEventStore, useTodoStore, useHabitStore, useMonthEvents, useCreateEventMutation, toDateString } from '@time-pie/core'
import { Header, BottomNav, FloatingAddButton, EventModal } from '../components'
import type { EventInsert } from '@time-pie/supabase'
import { useAuth } from '../providers'
import Link from 'next/link'

type ViewMode = 'week' | 'month'

export default function CalendarPage() {
  const { user } = useAuth()
  const { events: storeEvents, selectedDate, setSelectedDate } = useEventStore()
  const { todos } = useTodoStore()
  const { getHabitsWithStreak } = useHabitStore()
  const createEventMutation = useCreateEventMutation()

  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const habitsWithStreak = getHabitsWithStreak()

  // Load month events with React Query
  const { data: monthEventsData, isLoading: isLoadingMonth } = useMonthEvents(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1
  )

  // Get calendar data
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: Date[] = []

    // Add days from previous month
    const startPadding = firstDay.getDay()
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push(date)
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // Add days from next month to complete the grid
    const endPadding = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= endPadding; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }, [currentMonth])

  // Get week days
  const weekDays = useMemo(() => {
    const days: Date[] = []
    const startOfWeek = new Date(selectedDate)
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }, [selectedDate])

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
  const todayStr = toDateString()

  const getEventsForDate = (date: Date) => {
    const dateStr = toDateString(date)
    // API 데이터가 있으면 사용, 없으면 storeEvents 사용 (폴백)
    const eventsToUse = monthEventsData?.events && monthEventsData.events.length > 0
      ? monthEventsData.events
      : storeEvents
    return eventsToUse.filter((e: any) => e.start_at.startsWith(dateStr))
  }

  const getTodosForDate = (date: Date) => {
    const dateStr = toDateString(date)
    return todos.filter((t) => t.due_date === dateStr)
  }

  const handleAddEvent = async (event: Omit<EventInsert, 'user_id'>) => {
    if (!user) return
    await createEventMutation.mutateAsync({ ...event, user_id: user.id })
  }

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
    setSelectedDate(new Date())
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pb-20">
      <Header title="캘린더" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('week')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'week'
                ? 'bg-secondary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            주간
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'month'
                ? 'bg-secondary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            월간
          </button>
        </div>

        {viewMode === 'month' ? (
          /* Month View */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <div className="text-center">
                <h2 className="font-semibold dark:text-white">
                  {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                </h2>
                <button onClick={goToToday} className="text-xs text-primary hover:underline">
                  오늘로 이동
                </button>
              </div>
              <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayLabels.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-xs font-medium py-2 ${i === 0 ? 'text-error' : i === 6 ? 'text-secondary' : 'text-gray-500'
                    }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                const dateStr = toDateString(date)
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                const isToday = dateStr === todayStr
                const isSelected = dateStr === toDateString(selectedDate)
                const dayEvents = getEventsForDate(date)
                const dayTodos = getTodosForDate(date)
                const dayOfWeek = date.getDay()

                return (
                  <button
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`aspect-square p-1 rounded-lg transition-colors relative ${isSelected
                        ? 'bg-primary text-white'
                        : isToday
                          ? 'bg-primary/10 text-primary'
                          : isCurrentMonth
                            ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'text-gray-300 dark:text-gray-600'
                      }`}
                  >
                    <span
                      className={`text-sm ${!isSelected && dayOfWeek === 0
                          ? 'text-error'
                          : !isSelected && dayOfWeek === 6
                            ? 'text-secondary'
                            : ''
                        }`}
                    >
                      {date.getDate()}
                    </span>
                    {/* Event indicators */}
                    {(dayEvents.length > 0 || dayTodos.length > 0) && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                        {dayEvents.length > 0 && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'}`} />
                        )}
                        {dayTodos.length > 0 && (
                          <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-secondary'}`} />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Week View */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((date) => {
                const dateStr = toDateString(date)
                const isToday = dateStr === todayStr
                const isSelected = dateStr === toDateString(selectedDate)
                const dayOfWeek = date.getDay()

                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center p-2 rounded-xl transition-colors ${isSelected
                        ? 'bg-primary text-white'
                        : isToday
                          ? 'bg-primary/10'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <span
                      className={`text-xs mb-1 ${!isSelected && dayOfWeek === 0
                          ? 'text-error'
                          : !isSelected && dayOfWeek === 6
                            ? 'text-secondary'
                            : isSelected
                              ? 'text-white/80'
                              : 'text-gray-500'
                        }`}
                    >
                      {dayLabels[dayOfWeek]}
                    </span>
                    <span className="text-lg font-medium">{date.getDate()}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Selected Date Events */}
        <div className="mt-4">
          <h3 className="font-medium mb-3 flex items-center gap-2 dark:text-white">
            <span>📅</span>
            {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
            {toDateString(selectedDate) === todayStr && (
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">오늘</span>
            )}
          </h3>

          {/* Events */}
          <div className="space-y-2">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center bg-white dark:bg-gray-800 rounded-xl">
                일정이 없습니다
              </p>
            ) : (
              getEventsForDate(selectedDate).map((event: any) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
                >
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium dark:text-white">{event.title}</p>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        event.event_type === 'anchor'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                          : event.event_type === 'soft'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                      }`}>
                        {event.event_type === 'anchor' ? '⚓ 앵커' : event.event_type === 'soft' ? '☁️ 소프트' : '🔒 하드'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {event.start_at.split('T')[1].slice(0, 5)} -{' '}
                      {event.end_at.split('T')[1].slice(0, 5)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Todos */}
          {getTodosForDate(selectedDate).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">할 일</h4>
              <div className="space-y-2">
                {getTodosForDate(selectedDate).map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm"
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${todo.is_completed
                          ? 'bg-success border-success'
                          : 'border-gray-300'
                        }`}
                    >
                      {todo.is_completed && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`dark:text-white ${todo.is_completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                      {todo.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link to Pie View */}
          <Link
            href="/"
            className="mt-4 block text-center py-3 bg-primary/10 text-primary rounded-xl font-medium hover:bg-primary/20 transition-colors"
          >
            파이 차트로 보기 →
          </Link>
        </div>
      </main>

      <FloatingAddButton onAddEvent={() => setEventModalOpen(true)} />
      <BottomNav />

      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleAddEvent}
        selectedDate={selectedDate}
      />
    </div>
  )
}
