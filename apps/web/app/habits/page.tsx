'use client'

import { toDateString, useCreateHabitMutation, useHabitLogsQuery, useHabitsQuery, useLogHabitMutation } from '@time-pie/core'
import type { HabitInsert } from '@time-pie/supabase'
import { Check, Flame, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useMemo, useState } from 'react'
import { BottomNav, FloatingAddButton, Header } from '../components'
import { useAuth } from '../providers'

const HabitModal = dynamic(
  () => import('../components/HabitModal').then((m) => ({ default: m.HabitModal })),
  { loading: () => null }
)

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

  // ✅ habits가 로딩 완료되었고 habitIds가 있을 때만 logs 로딩을 "로딩중"으로 판단
  //    이렇게 하면 habits → logs 순차 로딩 시 스피너가 한 번만 표시됨
  const isLoading = isLoadingHabits || (habitIds.length > 0 && isLoadingLogs)

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
  const last7Days = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return toDateString(date)
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayStr]
  )

  const dayLabels = ['일', '월', '화', '수', '목', '금', '토']

  const handleAddHabit = useCallback(
    async (habit: Omit<HabitInsert, 'user_id'>) => {
      if (!user) return
      try {
        await createHabitMutation.mutateAsync({ ...habit, user_id: user.id })
        setModalOpen(false)
      } catch (error) {
        console.error('Failed to create habit:', error)
      }
    },
    [user, createHabitMutation]
  )

  const handleToggleHabit = useCallback(
    async (habitId: string) => {
      if (togglingId) return
      setTogglingId(habitId)
      try {
        await logHabitMutation.mutateAsync({ habitId, date: todayStr })
      } catch (error) {
        console.error('Failed to log habit:', error)
      } finally {
        setTogglingId(null)
      }
    },
    [togglingId, todayStr, logHabitMutation]
  )

  const getHabitLogForDate = (habitId: string, date: string) => {
    return logs.some((l) => l.habit_id === habitId && l.date === date)
  }

  // Calculate completion rate
  const completionRate = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="습관" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {isLoading ? (
          /* ✅ 인라인 스켈레톤: Header/BottomNav는 유지, 콘텐츠만 로딩 표시 */
          <div className="animate-pulse space-y-4">
            {/* Progress card skeleton */}
            <div className="bg-card p-5 rounded-2xl border border-border/50">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-7 w-12 bg-muted rounded" />
              </div>
              <div className="w-full h-3 bg-muted rounded-full" />
              <div className="h-4 w-28 bg-muted rounded mt-3 ml-auto" />
            </div>
            {/* Habit cards skeleton */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card p-5 rounded-2xl border border-border/50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
                <div className="flex justify-between bg-muted/20 p-3 rounded-xl">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <div key={d} className="flex flex-col items-center gap-2">
                      <div className="w-4 h-3 bg-muted rounded" />
                      <div className="w-7 h-7 bg-muted rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
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
          </>
        )}
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
