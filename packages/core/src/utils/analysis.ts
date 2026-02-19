import type { Event, EventExecution } from '@time-pie/supabase'

// Analysis result types
export interface UnrealisticPlanWarning {
  eventId: string
  eventTitle: string
  completionRate: number
  totalPlanned: number
  totalCompleted: number
  message: string
}

export interface TimeAdjustmentSuggestion {
  eventId: string
  eventTitle: string
  plannedDurationMin: number
  actualDurationMin: number
  suggestedDurationMin: number
  suggestedTime: string | null
  message: string
}

export interface CompletionTrend {
  date: string
  rate: number
}

export interface FlexibleEventAnalysis {
  eventId: string
  eventTitle: string
  avgCompletionRate: number
  totalExecutions: number
  completedCount: number
  skippedCount: number
  avgActualDurationMin: number
  avgPlannedDurationMin: number
  trend: CompletionTrend[]
}

/**
 * 비현실적 계획 감지
 * 14일간 완료율이 40% 미만인 유동 일정을 경고
 */
export function detectUnrealisticPlans(
  events: Event[],
  executions: EventExecution[]
): UnrealisticPlanWarning[] {
  const warnings: UnrealisticPlanWarning[] = []

  const flexibleEvents = events.filter((e) => e.event_type === 'task')

  for (const event of flexibleEvents) {
    const eventExecs = executions.filter((e) => e.event_id === event.id)
    if (eventExecs.length < 3) continue // 데이터 부족 시 스킵

    const completed = eventExecs.filter((e) => e.status === 'completed').length
    const rate = Math.round((completed / eventExecs.length) * 100)

    if (rate < 40) {
      warnings.push({
        eventId: event.id,
        eventTitle: event.title,
        completionRate: rate,
        totalPlanned: eventExecs.length,
        totalCompleted: completed,
        message: `'${event.title}'의 최근 완료율이 ${rate}%입니다. 시간이나 빈도를 조정해보세요.`,
      })
    }
  }

  return warnings
}

/**
 * 시간 조정 제안
 * 실제 소요 시간이 계획 대비 20% 이상 차이나는 경우 조정 제안
 */
export function suggestTimeAdjustments(
  events: Event[],
  executions: EventExecution[]
): TimeAdjustmentSuggestion[] {
  const suggestions: TimeAdjustmentSuggestion[] = []

  const flexibleEvents = events.filter((e) => e.event_type === 'task')

  for (const event of flexibleEvents) {
    const completedExecs = executions.filter(
      (e) => e.event_id === event.id && e.status === 'completed' && e.actual_start && e.actual_end
    )
    if (completedExecs.length < 3) continue

    const plannedDurations = completedExecs.map(
      (e) => (new Date(e.planned_end).getTime() - new Date(e.planned_start).getTime()) / 60000
    )
    const actualDurations = completedExecs.map(
      (e) => (new Date(e.actual_end!).getTime() - new Date(e.actual_start!).getTime()) / 60000
    )

    const avgPlanned = plannedDurations.reduce((a, b) => a + b, 0) / plannedDurations.length
    const avgActual = actualDurations.reduce((a, b) => a + b, 0) / actualDurations.length

    const diffRatio = Math.abs(avgActual - avgPlanned) / avgPlanned

    if (diffRatio > 0.2) {
      const suggestedMin = Math.round(avgActual)
      const direction = avgActual > avgPlanned ? '더 많은' : '더 적은'

      suggestions.push({
        eventId: event.id,
        eventTitle: event.title,
        plannedDurationMin: Math.round(avgPlanned),
        actualDurationMin: Math.round(avgActual),
        suggestedDurationMin: suggestedMin,
        suggestedTime: null,
        message: `'${event.title}'에 실제로 ${direction} 시간이 소요됩니다. ${suggestedMin}분으로 조정을 권장합니다.`,
      })
    }
  }

  return suggestions
}

/**
 * 완료율 트렌드 계산 (7일 이동평균)
 */
export function calculateCompletionTrend(
  executions: EventExecution[],
  days: number = 14
): CompletionTrend[] {
  if (executions.length === 0) return []

  // 날짜별 그룹핑
  const byDate = new Map<string, EventExecution[]>()
  for (const exec of executions) {
    const existing = byDate.get(exec.date) || []
    existing.push(exec)
    byDate.set(exec.date, existing)
  }

  // 날짜순 정렬
  const dates = Array.from(byDate.keys()).sort()
  const recentDates = dates.slice(-days)

  return recentDates.map((date) => {
    const dayExecs = byDate.get(date) || []
    const completed = dayExecs.filter((e) => e.status === 'completed').length
    const rate = dayExecs.length > 0 ? Math.round((completed / dayExecs.length) * 100) : 0
    return { date, rate }
  })
}

/**
 * 유동 일정 개별 성과 분석
 */
export function analyzeFlexibleEvent(
  event: Event,
  executions: EventExecution[]
): FlexibleEventAnalysis {
  const eventExecs = executions.filter((e) => e.event_id === event.id)
  const completed = eventExecs.filter((e) => e.status === 'completed')
  const skipped = eventExecs.filter((e) => e.status === 'skipped')

  const avgCompletionRate =
    completed.length > 0
      ? Math.round(completed.reduce((sum, e) => sum + e.completion_rate, 0) / completed.length)
      : 0

  const completedWithTimes = completed.filter((e) => e.actual_start && e.actual_end)
  const avgActualDurationMin =
    completedWithTimes.length > 0
      ? Math.round(
          completedWithTimes.reduce(
            (sum, e) =>
              sum + (new Date(e.actual_end!).getTime() - new Date(e.actual_start!).getTime()) / 60000,
            0
          ) / completedWithTimes.length
        )
      : 0

  const avgPlannedDurationMin =
    eventExecs.length > 0
      ? Math.round(
          eventExecs.reduce(
            (sum, e) =>
              sum + (new Date(e.planned_end).getTime() - new Date(e.planned_start).getTime()) / 60000,
            0
          ) / eventExecs.length
        )
      : 0

  const trend = calculateCompletionTrend(eventExecs)

  return {
    eventId: event.id,
    eventTitle: event.title,
    avgCompletionRate,
    totalExecutions: eventExecs.length,
    completedCount: completed.length,
    skippedCount: skipped.length,
    avgActualDurationMin,
    avgPlannedDurationMin,
    trend,
  }
}
