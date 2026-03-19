'use client'

import { memo } from 'react'

interface DailyCompletionChartProps {
  dailyCompletion: Array<{ date: string; rate: number }>
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일']

export const DailyCompletionChart = memo(function DailyCompletionChart({
  dailyCompletion,
}: DailyCompletionChartProps) {
  // Map by date, matching day-of-week to label
  const days = dailyCompletion.length === 7
    ? dailyCompletion.map((entry, i) => ({
        label: DAY_LABELS[i],
        rate: entry.rate,
        date: entry.date,
      }))
    : DAY_LABELS.map((label, i) => {
        const entry = dailyCompletion[i]
        return { label, rate: entry?.rate || 0, date: entry?.date || '' }
      })

  const maxRate = Math.max(...days.map((d) => d.rate), 1)
  const barMaxHeight = 100

  return (
    <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
      <h3 className="font-bold text-foreground mb-4">일별 완료율</h3>
      <div className="flex items-end justify-between gap-2" style={{ height: barMaxHeight + 32 }}>
        {days.map((day) => {
          const barHeight = maxRate > 0 ? (day.rate / 100) * barMaxHeight : 0
          return (
            <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-medium">
                {day.rate > 0 ? `${day.rate}%` : ''}
              </span>
              <div
                className="w-full rounded-t-md bg-primary/80 transition-all duration-300"
                style={{
                  height: Math.max(barHeight, day.rate > 0 ? 4 : 0),
                  minWidth: 20,
                }}
              />
              <span className="text-xs text-muted-foreground font-medium">{day.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
