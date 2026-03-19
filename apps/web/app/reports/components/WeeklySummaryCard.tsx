'use client'

import { memo } from 'react'

interface WeeklySummaryCardProps {
  totalEvents: number
  totalDurationMin: number
  completionRate: number
  prevWeekComparison: {
    duration_change: number
    completion_change: number
  } | null
}

function formatDuration(min: number) {
  const hours = Math.floor(min / 60)
  const mins = min % 60
  if (hours === 0) return `${mins}분`
  if (mins === 0) return `${hours}시간`
  return `${hours}시간 ${mins}분`
}

function ChangeIndicator({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-muted-foreground">-</span>
  const isPositive = value > 0
  return (
    <span className={`text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
      {isPositive ? '↑' : '↓'} {Math.abs(value)}%
    </span>
  )
}

export const WeeklySummaryCard = memo(function WeeklySummaryCard({
  totalEvents,
  totalDurationMin,
  completionRate,
  prevWeekComparison,
}: WeeklySummaryCardProps) {
  return (
    <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
      <h3 className="font-bold text-foreground mb-4">주간 요약</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{formatDuration(totalDurationMin)}</p>
          <p className="text-xs text-muted-foreground mt-1">총 시간</p>
          {prevWeekComparison && (
            <ChangeIndicator value={prevWeekComparison.duration_change} />
          )}
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{totalEvents}</p>
          <p className="text-xs text-muted-foreground mt-1">이벤트</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-500">{completionRate}%</p>
          <p className="text-xs text-muted-foreground mt-1">완료율</p>
          {prevWeekComparison && (
            <ChangeIndicator value={prevWeekComparison.completion_change} />
          )}
        </div>
      </div>
    </div>
  )
})
