'use client'

import { useState } from 'react'
import { PieChart, Spinner } from '@time-pie/ui'
import { useEventStore, useTodoStore, useHabitStore, useCurrentTime, useUserData, toDateString, useExecutionStore, useSuggestionStore, getPurposeInfo, getScheduleTypeInfo } from '@time-pie/core'
import { Header, BottomNav, FloatingAddButton, EventModal, TodoModal, HabitModal, ExecutionTimer } from './components'
import type { Event, EventInsert, TodoInsert, HabitInsert } from '@time-pie/supabase'
import { useAuth } from './providers'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const currentTime = useCurrentTime()
  const { events, selectedDate, setSelectedDate } = useEventStore()
  const { todos, toggleComplete } = useTodoStore()
  const { habits, getHabitsWithStreak, getTodayProgress } = useHabitStore()
  const { activeExecution } = useExecutionStore()
  const topSuggestion = useSuggestionStore((s) => s.getTopSuggestion())
  const unreadCount = useSuggestionStore((s) => s.getUnreadCount())

  const {
    isLoading,
    createEvent,
    updateEvent,
    createTodo,
    createHabit,
    logHabit,
    toggleTodoComplete,
    startEventExecution,
    completeEventExecution,
    skipEventExecution,
    markSuggestionAsRead,
  } = useUserData(user?.id)

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [todoModalOpen, setTodoModalOpen] = useState(false)
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'pie' | 'list'>('pie')
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>(undefined)

  const todayStr = toDateString(selectedDate)
  const todayTodos = todos.filter((t) => t.due_date === todayStr || !t.due_date)
  const completedTodos = todayTodos.filter((t) => t.is_completed).length
  const habitsWithStreak = getHabitsWithStreak()
  const habitProgress = getTodayProgress()

  // Filter events for selected date
  const selectedDayOfWeek = selectedDate.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  const todayEvents = events.filter((e) => {
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

  // Convert to pie chart format
  const pieEvents = todayEvents.map((e) => ({
    id: e.id,
    title: e.title,
    start_at: e.start_at,
    end_at: e.end_at,
    color: e.color,
    event_type: e.event_type,
  }))

  const handleAddEvent = async (event: Omit<EventInsert, 'user_id'>) => {
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, event)
    } else {
      await createEvent(event)
    }
    setSelectedEvent(undefined)
  }

  const handleAddTodo = async (todo: Omit<TodoInsert, 'user_id'>) => {
    try {
      await createTodo(todo)
      setTodoModalOpen(false)
    } catch (error) {
      console.error('Failed to create todo:', error)
    }
  }

  const handleAddHabit = async (habit: Omit<HabitInsert, 'user_id'>) => {
    try {
      await createHabit(habit)
      setHabitModalOpen(false)
    } catch (error) {
      console.error('Failed to create habit:', error)
    }
  }

  const handleTodoToggle = async (todoId: string) => {
    try {
      await toggleTodoComplete(todoId)
    } catch (error) {
      console.error('Failed to toggle todo:', error)
      // Fallback to local toggle
      toggleComplete(todoId)
    }
  }

  const handleHabitToggle = async (habitId: string) => {
    try {
      await logHabit(habitId, todayStr)
    } catch (error) {
      console.error('Failed to log habit:', error)
    }
  }

  const handleStartTracking = async (event: Event) => {
    if (event.event_type !== 'soft') return
    try {
      await startEventExecution(event.id, event.start_at, event.end_at)
    } catch (error) {
      console.error('Failed to start tracking:', error)
    }
  }

  const handleStopTracking = async () => {
    if (!activeExecution) return
    try {
      await completeEventExecution(activeExecution.id)
    } catch (error) {
      console.error('Failed to stop tracking:', error)
    }
  }

  const handleSkipTracking = async () => {
    if (!activeExecution) return
    try {
      await skipEventExecution(activeExecution.id)
    } catch (error) {
      console.error('Failed to skip tracking:', error)
    }
  }

  // Loading state
  if (authLoading) {
    return <Spinner size="lg" fullScreen />
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pb-20">
      <Header
        showDate
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('pie')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'pie'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            파이 차트
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list'
              ? 'bg-primary text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
          >
            리스트
          </button>
        </div>

        {viewMode === 'pie' ? (
          /* Pie Chart View */
          <div className="relative flex flex-col items-center">
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-gray-900/60 rounded-xl backdrop-blur-sm">
                <Spinner size="md" />
              </div>
            )}
            <PieChart
              events={pieEvents}
              currentTime={currentTime}
              selectedDate={selectedDate}
              size={300}
              showLabels
              showCurrentTime
              onEventClick={(pieEvent) => {
                const event = todayEvents.find((e) => e.id === pieEvent.id)
                if (event) {
                  if (event.event_type === 'soft' && !activeExecution) {
                    handleStartTracking(event)
                  } else {
                    setSelectedEvent(event)
                    setEventModalOpen(true)
                  }
                }
              }}
              onTimeSlotClick={(hour) => {
                setEventModalOpen(true)
                // Optional: Pre-fill time based on clicked hour
              }}
            />

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {todayEvents.map((event) => {
                const purposeInfo = getPurposeInfo(event.purpose)
                const typeInfo = getScheduleTypeInfo(event.event_type)
                return (
                  <div key={event.id} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {typeInfo && <span className="mr-0.5">{typeInfo.emoji}</span>}
                      {purposeInfo && <span className="mr-0.5">{purposeInfo.emoji}</span>}
                      {event.title}
                    </span>
                    {event.event_type === 'soft' && event.weekly_goal && (
                      <span className="text-[10px] px-1 py-0.5 rounded font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                        주 {event.weekly_goal}회
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>⏰</span> 오늘의 일정
            </h3>
            {todayEvents.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">일정이 없습니다</p>
            ) : (
              todayEvents.map((event) => {
                const purposeInfo = getPurposeInfo(event.purpose)
                const typeInfo = getScheduleTypeInfo(event.event_type)
                return (
                  <div
                    key={event.id}
                    className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm ${event.event_type === 'anchor' ? 'border-l-4' : ''
                      }`}
                    style={event.event_type === 'anchor' ? { borderLeftColor: event.color } : undefined}
                  >
                    <div
                      className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {typeInfo && <span className="text-sm">{typeInfo.emoji}</span>}
                        {purposeInfo && <span>{purposeInfo.emoji}</span>}
                        <p className="font-medium dark:text-white">{event.title}</p>
                        {event.event_type === 'soft' && event.weekly_goal && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400">
                            주 {event.weekly_goal}회
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {event.start_at.split('T')[1]?.slice(0, 5)} -{' '}
                        {event.end_at.split('T')[1]?.slice(0, 5)}
                        {event.event_type === 'hard' && event.repeat_days && event.repeat_days.length > 0 && (
                          <span className="ml-2 text-xs text-gray-400">
                            {event.repeat_days.map(d => ['일', '월', '화', '수', '목', '금', '토'][d]).join('·')}
                          </span>
                        )}
                      </p>
                    </div>
                    {event.event_type === 'soft' && !activeExecution && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartTracking(event)
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        추적
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* AI Insight */}
        {topSuggestion && (
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">💡</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {topSuggestion.title}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  {topSuggestion.description}
                </p>
              </div>
              <button
                onClick={() => markSuggestionAsRead(topSuggestion.id)}
                className="text-xs text-blue-500 hover:text-blue-700 flex-shrink-0"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* Today's Summary */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {/* Todos Summary */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2 dark:text-white">
                <span>✅</span> 투두
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {completedTodos}/{todayTodos.length}
              </span>
            </div>
            <div className="space-y-2">
              {todayTodos.slice(0, 3).map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleTodoToggle(todo.id)}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${todo.is_completed
                      ? 'bg-success border-success'
                      : 'border-gray-300 hover:border-success'
                      }`}
                  >
                    {todo.is_completed && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm flex-1 ${todo.is_completed ? 'text-gray-400 line-through' : ''
                      }`}
                  >
                    <span className="dark:text-gray-200">{todo.title}</span>
                  </span>
                </div>
              ))}
              {todayTodos.length > 3 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">+{todayTodos.length - 3}개 더</p>
              )}
              {todayTodos.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">투두가 없습니다</p>
              )}
            </div>
          </div>

          {/* Habits Summary */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <span>🔥</span> 습관
              </h3>
              <span className="text-sm text-gray-500">
                {habitProgress.completed}/{habitProgress.total}
              </span>
            </div>
            <div className="space-y-2">
              {habitsWithStreak.slice(0, 3).map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => handleHabitToggle(habit.id)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors`}
                    style={{
                      backgroundColor: habit.todayCompleted ? habit.color : 'transparent',
                      borderColor: habit.color,
                    }}
                  >
                    {habit.todayCompleted && (
                      <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm flex-1 dark:text-gray-200">{habit.title}</span>
                  {habit.streak > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {habit.streak}일
                    </span>
                  )}
                </div>
              ))}
              {habitsWithStreak.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-gray-500">습관이 없습니다</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Execution Timer */}
      {activeExecution && (
        <ExecutionTimer
          eventTitle={todayEvents.find((e) => e.id === activeExecution.event_id)?.title || ''}
          startTime={new Date(activeExecution.actual_start || activeExecution.planned_start)}
          onStop={handleStopTracking}
          onSkip={handleSkipTracking}
        />
      )}

      <FloatingAddButton
        onAddEvent={() => setEventModalOpen(true)}
        onAddTodo={() => setTodoModalOpen(true)}
        onAddHabit={() => setHabitModalOpen(true)}
      />

      <BottomNav />

      {/* Modals */}
      <EventModal
        isOpen={eventModalOpen}
        onClose={() => {
          setEventModalOpen(false)
          setSelectedEvent(undefined)
        }}
        onSave={handleAddEvent}
        selectedDate={selectedDate}
        initialData={selectedEvent}
      />
      <TodoModal
        isOpen={todoModalOpen}
        onClose={() => setTodoModalOpen(false)}
        onSave={handleAddTodo}
      />
      <HabitModal
        isOpen={habitModalOpen}
        onClose={() => setHabitModalOpen(false)}
        onSave={handleAddHabit}
      />
    </div>
  )
}
