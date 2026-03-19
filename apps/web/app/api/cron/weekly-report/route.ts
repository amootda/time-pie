import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const maxDuration = 300

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/cron/weekly-report
 * 매주 월요일 00:00 UTC (09:00 KST) 실행
 * 전주(월~일) 데이터를 집계하여 weekly_reports에 저장
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  try {
    // 전주 월~일 범위 계산 (월요일 크론 기준, 지난주 월~일)
    const now = new Date()
    // 지난 월요일 = 오늘 - ((오늘요일 + 6) % 7) - 7
    const daysSinceMonday = (now.getUTCDay() + 6) % 7
    const weekStart = new Date(now)
    weekStart.setUTCDate(now.getUTCDate() - daysSinceMonday - 7)
    weekStart.setUTCHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6)
    weekEnd.setUTCHours(23, 59, 59, 999)

    const weekStartStr = weekStart.toISOString().split('T')[0]
    const weekEndStr = weekEnd.toISOString().split('T')[0]
    const weekStartISO = weekStart.toISOString()
    const weekEndISO = weekEnd.toISOString()

    // 전체 유저 조회 (페이지네이션)
    const allUsers: Array<{ id: string }> = []
    const perPage = 1000
    let page = 1
    while (true) {
      const { data: { users: pageUsers }, error: usersError } = await supabase.auth.admin.listUsers({ page, perPage })
      if (usersError) {
        console.error('Failed to list users:', usersError)
        return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
      }
      if (!pageUsers || pageUsers.length === 0) break
      allUsers.push(...pageUsers.map((u) => ({ id: u.id })))
      if (pageUsers.length < perPage) break
      page++
    }

    if (allUsers.length === 0) {
      return NextResponse.json({ processed: 0 })
    }

    const users = allUsers

    let processedCount = 0

    // 유저별 병렬 처리
    const results = await Promise.allSettled(
      users.map(async (user) => {
        const userId = user.id

        // 1. 이벤트 조회 (전주 범위)
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', userId)
          .gte('start_at', weekStartISO)
          .lte('end_at', weekEndISO)

        if (eventsError) {
          console.error(`Events error for ${userId}:`, eventsError)
          throw eventsError
        }

        // purpose별 duration 합산
        const purposeDistribution: Record<string, number> = {}
        let totalDurationMin = 0

        for (const event of events || []) {
          const startMs = new Date(event.start_at).getTime()
          const endMs = new Date(event.end_at).getTime()
          const durationMin = Math.round((endMs - startMs) / 60000)
          totalDurationMin += durationMin

          const purpose = event.purpose || 'other'
          purposeDistribution[purpose] = (purposeDistribution[purpose] || 0) + durationMin
        }

        // 2. 실행 기록 조회 (완료율)
        const { data: executions, error: execError } = await supabase
          .from('event_executions')
          .select('*')
          .eq('user_id', userId)
          .gte('date', weekStartStr)
          .lte('date', weekEndStr)

        if (execError) {
          console.error(`Executions error for ${userId}:`, execError)
          throw execError
        }

        // 전체 완료율
        const totalExecs = executions?.length || 0
        const completedExecs = executions?.filter(
          (e) => e.status === 'completed'
        ).length || 0
        const completionRate = totalExecs > 0
          ? Math.round((completedExecs / totalExecs) * 100 * 100) / 100
          : 0

        // 일별 완료율
        const dailyMap = new Map<string, { total: number; completed: number }>()
        for (const exec of executions || []) {
          const date = exec.date
          const entry = dailyMap.get(date) || { total: 0, completed: 0 }
          entry.total++
          if (exec.status === 'completed') entry.completed++
          dailyMap.set(date, entry)
        }

        // 7일 모두 포함 (빈 날도 rate: 0)
        const dailyCompletion: Array<{ date: string; rate: number }> = []
        for (let d = 0; d < 7; d++) {
          const dayDate = new Date(weekStart)
          dayDate.setUTCDate(weekStart.getUTCDate() + d)
          const dateStr = dayDate.toISOString().split('T')[0]
          const entry = dailyMap.get(dateStr)
          dailyCompletion.push({
            date: dateStr,
            rate: entry && entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0,
          })
        }

        // 3. 습관 요약
        const { data: habits, error: habitsError } = await supabase
          .from('habits')
          .select('id, title')
          .eq('user_id', userId)
          .eq('is_active', true)

        if (habitsError) {
          console.error(`Habits error for ${userId}:`, habitsError)
          throw habitsError
        }

        const activeHabits = habits || []
        let habitLogs: Array<{ habit_id: string; date: string }> = []
        if (activeHabits.length > 0) {
          const { data, error: logsError } = await supabase
            .from('habit_logs')
            .select('habit_id, date')
            .in('habit_id', activeHabits.map((h) => h.id))
            .gte('date', weekStartStr)
            .lte('date', weekEndStr)
          if (logsError) {
            console.error(`Habit logs error for ${userId}:`, logsError)
            throw logsError
          }
          habitLogs = data || []
        }

        const habitSummary = {
          total: habits?.length || 0,
          logs: habitLogs?.length || 0,
          rate: (habits?.length || 0) > 0
            ? Math.round(((habitLogs?.length || 0) / ((habits?.length || 0) * 7)) * 100)
            : 0,
        }

        // 4. 할일 요약
        const { data: todos, error: todosError } = await supabase
          .from('todos')
          .select('id, is_completed')
          .eq('user_id', userId)
          .gte('created_at', weekStartISO)
          .lte('created_at', weekEndISO)

        if (todosError) {
          console.error(`Todos error for ${userId}:`, todosError)
          throw todosError
        }

        const todoSummary = {
          total: todos?.length || 0,
          completed: todos?.filter((t) => t.is_completed).length || 0,
        }

        // 5. 전주 비교
        const prevWeekStart = new Date(weekStart)
        prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7)
        const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0]

        const { data: prevReport } = await supabase
          .from('weekly_reports')
          .select('total_duration_min, completion_rate')
          .eq('user_id', userId)
          .eq('week_start', prevWeekStartStr)
          .single()

        const prevWeekComparison = prevReport
          ? {
              duration_change: prevReport.total_duration_min > 0
                ? Math.round(((totalDurationMin - prevReport.total_duration_min) / prevReport.total_duration_min) * 100)
                : 0,
              completion_change: prevReport.completion_rate > 0
                ? Math.round(((completionRate - Number(prevReport.completion_rate)) / Number(prevReport.completion_rate)) * 100)
                : 0,
            }
          : null

        // 6. AI 인사이트 (규칙 기반)
        const aiInsights: Array<{ type: string; message: string }> = []

        // 성취 인사이트
        if (prevWeekComparison && prevWeekComparison.duration_change > 20) {
          aiInsights.push({
            type: 'achievement',
            message: `전주 대비 활동 시간이 ${prevWeekComparison.duration_change}% 증가했습니다`,
          })
        }

        // 경고 인사이트
        if (totalDurationMin > 0) {
          const workMin = purposeDistribution['work'] || 0
          const workRatio = (workMin / totalDurationMin) * 100
          if (workRatio > 70) {
            aiInsights.push({
              type: 'warning',
              message: `업무 비중이 ${Math.round(workRatio)}%로 높습니다. 균형 잡힌 시간 배분을 고려해보세요`,
            })
          }
        }

        // 패턴 인사이트
        if (dailyCompletion.length > 0) {
          const bestDay = dailyCompletion.reduce((best, day) =>
            day.rate > best.rate ? day : best
          )
          if (bestDay.rate > 0) {
            const dayOfWeek = new Date(bestDay.date).getUTCDay()
            const dayLabels = ['일', '월', '화', '수', '목', '금', '토']
            aiInsights.push({
              type: 'pattern',
              message: `${dayLabels[dayOfWeek]}요일 완료율이 ${bestDay.rate}%로 가장 높았습니다`,
            })
          }
        }

        if (completionRate >= 80) {
          aiInsights.push({
            type: 'achievement',
            message: `주간 완료율 ${completionRate}%를 달성했습니다! 훌륭합니다`,
          })
        }

        // 7. Upsert
        const { error: upsertError } = await supabase
          .from('weekly_reports')
          .upsert(
            {
              user_id: userId,
              week_start: weekStartStr,
              week_end: weekEndStr,
              total_events: events?.length || 0,
              total_duration_min: totalDurationMin,
              purpose_distribution: purposeDistribution,
              completion_rate: completionRate,
              daily_completion: dailyCompletion,
              prev_week_comparison: prevWeekComparison,
              habit_summary: habitSummary,
              todo_summary: todoSummary,
              ai_insights: aiInsights,
            },
            { onConflict: 'user_id,week_start' }
          )

        if (upsertError) {
          console.error(`Upsert error for ${userId}:`, upsertError)
          throw upsertError
        }

        processedCount++
      })
    )

    const failures = results.filter((r) => r.status === 'rejected')
    if (failures.length > 0) {
      console.error(`${failures.length} users failed`)
    }

    return NextResponse.json({
      processed: processedCount,
      total_users: users.length,
      week: `${weekStartStr} ~ ${weekEndStr}`,
    })
  } catch (error) {
    console.error('Weekly report cron error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
