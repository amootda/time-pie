'use client'

import { toDateString, useCreateHabitMutation, useHabitLogsQuery, useHabitsQuery, useLogHabitMutation } from '@time-pie/core'
import type { HabitInsert } from '@time-pie/supabase'
import { Check, Flame, PieChart, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { BottomNav, FloatingAddButton, HabitModal, Header } from '../components'
import { useAuth } from '../providers'

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
          <div className="absolute w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
          <PieChart className="w-8 h-8 text-primary/80" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="습관" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Today's Progress */}
        <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">오늘의 진행률</h2>
            <span className="text-2xl font-bold text-primary">{completionRate}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-500 ease-out"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground mt-3 font-medium text-right">
            {progress.total}개 중 {progress.completed}개 완료
          </p>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          {habitsWithStreak.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-yellow-500 fill-yellow-500/20" />
              </div>
              <p className="text-foreground font-semibold mb-1">습관이 없습니다</p>
              <p className="text-muted-foreground text-sm mb-6">새로운 습관을 만들어보세요!</p>
              <button
                onClick={() => setModalOpen(true)}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                습관 추가하기
              </button>
            </div>
          ) : (
            habitsWithStreak.map((habit) => (
              <div key={habit.id} className="bg-card p-5 rounded-2xl shadow-sm border border-border/50 hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {/* Toggle Button */}
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      disabled={togglingId === habit.id}
                      className={`cursor-pointer w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${habit.todayCompleted
                        ? 'scale-105 shadow-md'
                        : 'border-2  bg-background'
                        } ${togglingId === habit.id ? 'opacity-50 cursor-wait' : ''}`}
                      style={{
                        backgroundColor: habit.todayCompleted ? habit.color : undefined,
                        borderColor: habit.color,
                        boxShadow: habit.todayCompleted ? `0 4px 12px ${habit.color}40` : undefined,
                      }}
                    >
                      {habit.todayCompleted ? (
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      ) : (
                        <span className="text-2xl font-light mb-0.5" style={{ color: habit.color }}>+</span>
                      )}
                    </button>
                    <div>
                      <h3 className="font-bold text-foreground text-lg mb-0.5">{habit.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                          {habit.frequency === 'daily' ? '매일' : '매주'}
                        </span>
                        {habit.streak > 0 && (
                          <div className="flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-md">
                            <Flame className="w-3 h-3 fill-orange-500" />
                            <span>{habit.streak}일 연속</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Progress */}
                <div className="flex justify-between items-end bg-muted/20 p-3 rounded-xl">
                  {last7Days.map((date) => {
                    const completed = getHabitLogForDate(habit.id, date)
                    const isToday = date === todayStr
                    const dayOfWeek = new Date(date).getDay()
                    return (
                      <div key={date} className="flex flex-col items-center gap-2">
                        <span className={`text-[10px] font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                          {dayLabels[dayOfWeek]}
                        </span>
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${completed
                            ? 'text-white shadow-sm scale-110'
                            : isToday
                              ? 'border-2 border-dashed bg-background'
                              : 'bg-muted/50'
                            }`}
                          style={{
                            backgroundColor: completed ? habit.color : undefined,
                            borderColor: isToday && !completed ? habit.color : undefined,
                          }}
                        >
                          {completed && <Check className="w-4 h-4" strokeWidth={3} />}
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
