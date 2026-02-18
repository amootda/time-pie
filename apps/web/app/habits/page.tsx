'use client'

import { useState, useMemo } from 'react'
import { PieChart } from 'lucide-react'
import { useHabitsQuery, useHabitLogsQuery, useLogHabitMutation, useCreateHabitMutation, toDateString } from '@time-pie/core'
import { Header, BottomNav, FloatingAddButton, HabitModal } from '../components'
import { useAuth } from '../providers'
import type { HabitInsert } from '@time-pie/supabase'

export default function HabitsPage() {
  const { user } = useAuth()
  const createHabitMutation = useCreateHabitMutation()
  const logHabitMutation = useLogHabitMutation()
  const [modalOpen, setModalOpen] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const todayStr = toDateString()

  // Fetch habits using React Query
  const { data: habits = [], isLoading: isLoadingHabits } = useHabitsQuery(user?.id)

  // Calculate date range for last 30 days
  const dateRange = useMemo(() => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)
    return {
      start: toDateString(startDate),
      end: toDateString(endDate),
    }
  }, [])

  // Fetch habit logs for all habits
  const habitIds = useMemo(() => habits.map((h) => h.id), [habits])
  const { data: logs = [], isLoading: isLoadingLogs } = useHabitLogsQuery(
    habitIds,
    dateRange.start,
    dateRange.end,
    habitIds.length > 0
  )

  const isLoading = isLoadingHabits || isLoadingLogs

  // Calculate habits with streak and today completion status
  const habitsWithStreak = useMemo(() => {
    return habits.map((habit) => {
      const habitLogs = logs.filter((log) => log.habit_id === habit.id)
      const todayCompleted = habitLogs.some((log) => log.date === todayStr)

      // Calculate streak
      let streak = 0
      const today = new Date()
      let checkDate = new Date(today)

      while (true) {
        const dateStr = toDateString(checkDate)
        const hasLog = habitLogs.some((log) => log.date === dateStr)
        if (!hasLog) break
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      }

      return {
        ...habit,
        streak,
        todayCompleted,
      }
    })
  }, [habits, logs, todayStr])

  // Calculate today's progress
  const progress = useMemo(() => {
    const total = habits.length
    const completed = habitsWithStreak.filter((h) => h.todayCompleted).length
    return { total, completed }
  }, [habits.length, habitsWithStreak])

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return toDateString(date)
  })

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']

  const handleAddHabit = async (habit: Omit<HabitInsert, 'user_id'>) => {
    if (!user) return
    try {
      await createHabitMutation.mutateAsync({ ...habit, user_id: user.id })
      setModalOpen(false)
    } catch (error) {
      console.error('Failed to create habit:', error)
    }
  }

  const handleToggleHabit = async (habitId: string) => {
    if (togglingId) return
    setTogglingId(habitId)
    try {
      await logHabitMutation.mutateAsync({ habitId, date: todayStr })
    } catch (error) {
      console.error('Failed to log habit:', error)
    } finally {
      setTogglingId(null)
    }
  }

  const getHabitLogForDate = (habitId: string, date: string) => {
    return logs.some((l) => l.habit_id === habitId && l.date === date)
  }

  // Calculate completion rate
  const completionRate = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin" />
          <PieChart className="w-8 h-8 text-primary/80" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary opacity-70"
              style={{
                animation: 'loading-dot 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
        <style jsx global>{`
          @keyframes loading-dot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 pb-20">
      <Header title="습관" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Today's Progress */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold dark:text-white">오늘의 진행률</h2>
            <span className="text-2xl font-bold text-primary">{completionRate}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-success transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {progress.completed}/{progress.total} 완료
          </p>
        </div>

        {/* Habits List */}
        <div className="space-y-3">
          {habitsWithStreak.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">⭐</p>
              <p className="text-gray-500 dark:text-gray-400">습관을 추가해보세요</p>
              <button
                onClick={() => setModalOpen(true)}
                className="mt-4 px-4 py-2 bg-success text-white rounded-lg text-sm font-medium"
              >
                습관 추가
              </button>
            </div>
          ) : (
            habitsWithStreak.map((habit) => (
              <div key={habit.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      disabled={togglingId === habit.id}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${habit.todayCompleted
                        ? 'scale-110'
                        : 'border-2 hover:scale-105'
                        } ${togglingId === habit.id ? 'opacity-50' : ''}`}
                      style={{
                        backgroundColor: habit.todayCompleted ? habit.color : 'transparent',
                        borderColor: habit.color,
                      }}
                    >
                      {habit.todayCompleted ? (
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-lg" style={{ color: habit.color }}>+</span>
                      )}
                    </button>
                    <div>
                      <p className="font-medium dark:text-white">{habit.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {habit.frequency === 'daily' ? '매일' : '매주'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {habit.streak > 0 && (
                      <p className="text-lg font-bold text-primary flex items-center gap-1">
                        <span>🔥</span> {habit.streak}일
                      </p>
                    )}
                  </div>
                </div>

                {/* Weekly Progress */}
                <div className="flex justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {last7Days.map((date) => {
                    const completed = getHabitLogForDate(habit.id, date)
                    const isToday = date === todayStr
                    const dayOfWeek = new Date(date).getDay()
                    return (
                      <div key={date} className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 mb-1">
                          {dayLabels[dayOfWeek]}
                        </span>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${completed
                            ? 'text-white'
                            : isToday
                              ? 'border-2 border-dashed'
                              : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                          style={{
                            backgroundColor: completed ? habit.color : undefined,
                            borderColor: isToday && !completed ? habit.color : undefined,
                          }}
                        >
                          {completed && '✓'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <FloatingAddButton onAddHabit={() => setModalOpen(true)} />
      <BottomNav />

      <HabitModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddHabit}
      />
    </div>
  )
}
