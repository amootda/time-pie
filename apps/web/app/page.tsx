'use client'

import { useState } from 'react'
import { PieChart } from '@time-pie/ui'
import { useEventStore, useTodoStore, useHabitStore, useCurrentTime, useUserData } from '@time-pie/core'
import { Header, BottomNav, FloatingAddButton, EventModal, TodoModal, HabitModal } from './components'
import type { EventInsert, TodoInsert, HabitInsert } from '@time-pie/supabase'
import { useAuth } from './providers'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const currentTime = useCurrentTime()
  const { events, selectedDate, setSelectedDate } = useEventStore()
  const { todos, toggleComplete } = useTodoStore()
  const { habits, getHabitsWithStreak, getTodayProgress } = useHabitStore()

  const {
    isLoading,
    createEvent,
    createTodo,
    createHabit,
    logHabit,
    toggleTodoComplete,
  } = useUserData(user?.id)

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [todoModalOpen, setTodoModalOpen] = useState(false)
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'pie' | 'list'>('pie')

  const todayStr = selectedDate.toISOString().split('T')[0]
  const todayTodos = todos.filter((t) => t.due_date === todayStr || !t.due_date)
  const completedTodos = todayTodos.filter((t) => t.is_completed).length
  const habitsWithStreak = getHabitsWithStreak()
  const habitProgress = getTodayProgress()

  // Filter events for selected date
  const todayEvents = events.filter((e) => e.start_at.startsWith(todayStr))

  // Convert to pie chart format
  const pieEvents = todayEvents.map((e) => ({
    id: e.id,
    title: e.title,
    start_at: e.start_at,
    end_at: e.end_at,
    color: e.color,
  }))

  const handleAddEvent = async (event: Omit<EventInsert, 'user_id'>) => {
    try {
      await createEvent(event)
      setEventModalOpen(false)
    } catch (error) {
      console.error('Failed to create event:', error)
    }
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

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        showDate
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Loading indicator */}
        {isLoading && (
          <div className="text-center text-sm text-gray-400 mb-4">
            데이터 로딩 중...
          </div>
        )}

        {/* View Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('pie')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'pie'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            파이 차트
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            리스트
          </button>
        </div>

        {viewMode === 'pie' ? (
          /* Pie Chart View */
          <div className="flex flex-col items-center">
            <PieChart
              events={pieEvents}
              currentTime={currentTime}
              selectedDate={selectedDate}
              size={300}
              showLabels
              showCurrentTime
              onEventClick={(event) => console.log('Event clicked:', event)}
              onTimeSlotClick={(hour) => {
                console.log('Time slot clicked:', hour)
                setEventModalOpen(true)
              }}
            />

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {Array.from(new Set(todayEvents.map((e) => e.color))).map((color) => {
                const event = todayEvents.find((e) => e.color === color)
                return (
                  <div key={color} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-gray-600">{event?.title}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <span>⏰</span> 오늘의 일정
            </h3>
            {todayEvents.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">일정이 없습니다</p>
            ) : (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm"
                >
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: event.color }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {event.start_at.split('T')[1].slice(0, 5)} -{' '}
                      {event.end_at.split('T')[1].slice(0, 5)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Today's Summary */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {/* Todos Summary */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <span>✅</span> 투두
              </h3>
              <span className="text-sm text-gray-500">
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
                    {todo.title}
                  </span>
                </div>
              ))}
              {todayTodos.length > 3 && (
                <p className="text-xs text-gray-400">+{todayTodos.length - 3}개 더</p>
              )}
              {todayTodos.length === 0 && (
                <p className="text-xs text-gray-400">투두가 없습니다</p>
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
                  <span className="text-sm flex-1">{habit.title}</span>
                  {habit.streak > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {habit.streak}일
                    </span>
                  )}
                </div>
              ))}
              {habitsWithStreak.length === 0 && (
                <p className="text-xs text-gray-400">습관이 없습니다</p>
              )}
            </div>
          </div>
        </div>
      </main>

      <FloatingAddButton
        onAddEvent={() => setEventModalOpen(true)}
        onAddTodo={() => setTodoModalOpen(true)}
        onAddHabit={() => setHabitModalOpen(true)}
      />

      <BottomNav />

      {/* Modals */}
      <EventModal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={handleAddEvent}
        selectedDate={selectedDate}
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
