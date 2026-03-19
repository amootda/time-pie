'use client'

import { useReportStore, useWeeklyReportsQuery } from '@time-pie/core'
import { useEffect, useMemo } from 'react'
import { BottomNav, Header } from '../components'
import { useAuth } from '../providers'
import { AIInsightsSection } from './components/AIInsightsSection'
import { DailyCompletionChart } from './components/DailyCompletionChart'
import { HabitTodoSummary } from './components/HabitTodoSummary'
import { PurposeDistributionChart } from './components/PurposeDistributionChart'
import { WeekSelector } from './components/WeekSelector'
import { WeeklySummaryCard } from './components/WeeklySummaryCard'

export default function ReportsPage() {
  const { user } = useAuth()
  const { data: reports = [], isLoading } = useWeeklyReportsQuery(user?.id)
  const { selectedWeekStart, setSelectedWeekStart } = useReportStore()

  // 첫 로드 시 최신 주 선택
  useEffect(() => {
    if (reports.length > 0 && !selectedWeekStart) {
      setSelectedWeekStart(reports[0].week_start)
    }
  }, [reports, selectedWeekStart, setSelectedWeekStart])

  const weeks = useMemo(
    () => reports.map((r) => ({ weekStart: r.week_start, weekEnd: r.week_end })),
    [reports]
  )

  const selectedReport = useMemo(
    () => reports.find((r) => r.week_start === selectedWeekStart) || null,
    [reports, selectedWeekStart]
  )

  return (
    <div className="fixed inset-0 bg-background flex flex-col overflow-hidden">
      <Header title="리포트" />

      <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto px-4 py-4 pb-24 no-scrollbar scroll-smooth-touch">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 w-28 bg-muted rounded-full shrink-0" />
              ))}
            </div>
            <div className="bg-card p-5 rounded-2xl border border-border/50">
              <div className="h-5 w-24 bg-muted rounded mb-4" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="h-8 w-16 bg-muted rounded" />
                    <div className="h-3 w-12 bg-muted rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card p-5 rounded-2xl border border-border/50 h-48" />
            <div className="bg-card p-5 rounded-2xl border border-border/50 h-36" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">📊</span>
            </div>
            <p className="text-foreground font-semibold mb-1">아직 리포트가 없습니다</p>
            <p className="text-muted-foreground text-sm">
              매주 월요일 자동으로 생성됩니다
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <WeekSelector
              weeks={weeks}
              selectedWeekStart={selectedWeekStart}
              onSelect={setSelectedWeekStart}
            />

            {selectedReport && (
              <>
                <WeeklySummaryCard
                  totalEvents={selectedReport.total_events}
                  totalDurationMin={selectedReport.total_duration_min}
                  completionRate={selectedReport.completion_rate}
                  prevWeekComparison={selectedReport.prev_week_comparison}
                />

                <PurposeDistributionChart
                  distribution={selectedReport.purpose_distribution}
                />

                <DailyCompletionChart
                  dailyCompletion={selectedReport.daily_completion}
                />

                <HabitTodoSummary
                  habitSummary={selectedReport.habit_summary}
                  todoSummary={selectedReport.todo_summary}
                />

                <AIInsightsSection
                  insights={selectedReport.ai_insights}
                />
              </>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
