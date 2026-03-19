'use client'

import { memo } from 'react'

interface HabitTodoSummaryProps {
  habitSummary: { total: number; logs: number; rate: number }
  todoSummary: { total: number; completed: number }
}

export const HabitTodoSummary = memo(function HabitTodoSummary({
  habitSummary,
  todoSummary,
}: HabitTodoSummaryProps) {
  const habitTotal = habitSummary.total
  const habitRate = habitSummary.rate
  const todoTotal = todoSummary.total
  const todoCompleted = todoSummary.completed

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card p-4 rounded-2xl shadow-sm border border-border/50">
        <div className="text-2xl mb-2">🏆</div>
        <h4 className="text-sm font-bold text-foreground mb-1">습관</h4>
        <p className="text-lg font-bold text-primary">{habitRate}%</p>
        <p className="text-xs text-muted-foreground">{habitTotal}개 습관 실천률</p>
      </div>
      <div className="bg-card p-4 rounded-2xl shadow-sm border border-border/50">
        <div className="text-2xl mb-2">✅</div>
        <h4 className="text-sm font-bold text-foreground mb-1">할일</h4>
        <p className="text-lg font-bold text-primary">
          {todoCompleted}/{todoTotal}
        </p>
        <p className="text-xs text-muted-foreground">완료</p>
      </div>
    </div>
  )
})
