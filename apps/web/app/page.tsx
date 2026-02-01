'use client'

import { useState, useEffect } from 'react'
import { PieChart } from '@time-pie/ui'
import { useEventStore, useTodoStore, useHabitStore, useCurrentTime } from '@time-pie/core'
import { Header, BottomNav, FloatingAddButton, EventModal, TodoModal, HabitModal } from './components'
import type { Event, Todo, Habit } from '@time-pie/supabase'

// Demo data
const DEMO_EVENTS: Event[] = [
  {
    id: '1',
    user_id: 'demo',
    title: '수면',
    description: null,
    start_at: `${new Date().toISOString().split('T')[0]}T00:00:00`,
    end_at: `${new Date().toISOString().split('T')[0]}T06:30:00`,
    is_all_day: false,
    color: '#34495E',
    category_id: null,
    reminder_min: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    title: '출근 준비',
    description: null,
    start_at: `${new Date().toISOString().split('T')[0]}T06:30:00`,
    end_at: `${new Date().toISOString().split('T')[0]}T08:00:00`,
    is_all_day: false,
    color: '#2ECC71',
    category_id: null,
    reminder_min: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    title: '업무',
    description: null,
    start_at: `${new Date().toISOString().split('T')[0]}T09:00:00`,
    end_at: `${new Date().toISOString().split('T')[0]}T12:00:00`,
    is_all_day: false,
    color: '#4A90D9',
    category_id: null,
    reminder_min: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: 'demo',
    title: '점심',
    description: null,
    start_at: `${new Date().toISOString().split('T')[0]}T12:00:00`,
    end_at: `${new Date().toISOString().split('T')[0]}T13:00:00`,
    is_all_day: false,
    color: '#F39C12',
    category_id: null,
    reminder_min: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: 'demo',
    title: '팀 미팅',
    description: '주간 회의',
    start_at: `${new Date().toISOString().split('T')[0]}T14:00:00`,
    end_at: `${new Date().toISOString().split('T')[0]}T15:30:00`,
    is_all_day: false,
    color: '#9B59B6',
    category_id: null,
    reminder_min: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    user_id: 'demo',
    title: '업무',
    description: null,
    start_at: `${new Date().toISOString().split('T')[0]}T15:30:00`,
    end_at: `${new Date().toISOString().split('T')[0]}T18:00:00`,
    is_all_day: false,
    color: '#4A90D9',
    category_id: null,
    reminder_min: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEMO_TODOS: Todo[] = [
  {
    id: '1',
    user_id: 'demo',
    title: '보고서 제출',
    description: null,
    due_date: new Date().toISOString().split('T')[0],
    priority: 'high',
    is_completed: false,
    completed_at: null,
    category_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    title: '이메일 확인',
    description: null,
    due_date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    is_completed: true,
    completed_at: new Date().toISOString(),
    category_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    title: '프로젝트 계획서 작성',
    description: null,
    due_date: new Date().toISOString().split('T')[0],
    priority: 'high',
    is_completed: false,
    completed_at: null,
    category_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEMO_HABITS: Habit[] = [
  {
    id: '1',
    user_id: 'demo',
    title: '물 2L 마시기',
    description: null,
    frequency: 'daily',
    frequency_config: {},
    target_count: 1,
    color: '#4A90D9',
    reminder_time: '09:00',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    title: '30분 운동',
    description: null,
    frequency: 'daily',
    frequency_config: {},
    target_count: 1,
    color: '#E74C3C',
    reminder_time: '07:00',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    title: '독서 30분',
    description: null,
    frequency: 'daily',
    frequency_config: {},
    target_count: 1,
    color: '#2ECC71',
    reminder_time: '21:00',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function HomePage() {
  const currentTime = useCurrentTime()
  const { events, setEvents, addEvent, selectedDate, setSelectedDate } = useEventStore()
  const { todos, setTodos, addTodo, toggleComplete } = useTodoStore()
  const { habits, setHabits, addHabit, logHabit, getHabitsWithStreak, getTodayProgress } = useHabitStore()

  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [todoModalOpen, setTodoModalOpen] = useState(false)
  const [habitModalOpen, setHabitModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'pie' | 'list'>('pie')

  // Initialize with demo data
  useEffect(() => {
    if (events.length === 0) setEvents(DEMO_EVENTS)
    if (todos.length === 0) setTodos(DEMO_TODOS)
    if (habits.length === 0) setHabits(DEMO_HABITS)
  }, [events.length, todos.length, habits.length, setEvents, setTodos, setHabits])

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

  const handleAddEvent = (event: Omit<Event, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    addEvent({
      ...event,
      id: crypto.randomUUID(),
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  const handleAddTodo = (todo: Omit<Todo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    addTodo({
      ...todo,
      id: crypto.randomUUID(),
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  const handleAddHabit = (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    addHabit({
      ...habit,
      id: crypto.randomUUID(),
      user_id: 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  const handleHabitToggle = (habitId: string) => {
    logHabit(habitId, todayStr)
  }

  return (
    <div className="min-h-screen bg-background pb-20">
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
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'pie'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            파이 차트
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
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
                  onClick={() => toggleComplete(todo.id)}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      todo.is_completed
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
                    className={`text-sm flex-1 ${
                      todo.is_completed ? 'text-gray-400 line-through' : ''
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
              ))}
              {todayTodos.length > 3 && (
                <p className="text-xs text-gray-400">+{todayTodos.length - 3}개 더</p>
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
