import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

// Fix 1: Module-level singleton instead of factory function
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/** endpoint를 마스킹하여 로깅 (개인정보 보호) */
function maskEndpoint(endpoint: string): string {
  try {
    const url = new URL(endpoint)
    const path = url.pathname
    return `${url.host}/...${path.slice(-8)}`
  } catch {
    return '***'
  }
}

/** 유저별 구독 맵 생성 */
function buildSubsByUser(subscriptions: { user_id: string; endpoint: string; p256dh: string; auth: string }[]) {
  const map = new Map<string, typeof subscriptions>()
  for (const sub of subscriptions) {
    const list = map.get(sub.user_id) || []
    list.push(sub)
    map.set(sub.user_id, list)
  }
  return map
}

// Fix 2: sendPushToUsers returns its own staleEndpoints
/** 푸시 발송 공통 함수 */
async function sendPushToUsers(
  subsByUser: ReturnType<typeof buildSubsByUser>,
  notifications: { userId: string; payload: string }[]
): Promise<{ sentCount: number; staleEndpoints: string[] }> {
  let sentCount = 0
  const staleEndpoints: string[] = []
  for (const { userId, payload } of notifications) {
    const userSubs = subsByUser.get(userId) || []
    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        )
        sentCount++
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode
        if (statusCode === 410 || statusCode === 404) {
          staleEndpoints.push(sub.endpoint)
        } else {
          console.error(`Push failed for ${maskEndpoint(sub.endpoint)}:`, err)
        }
      }
    }
  }
  return { sentCount, staleEndpoints }
}

// Fix 4: Validate timezone with fallback to Asia/Seoul
/** 유저 timezone 기준으로 HH:mm을 오늘 UTC timestamp로 변환 */
function localTimeToUtcMs(timeStr: string, timezone: string, now: Date): number {
  try {
    const safeTimezone = (() => {
      try {
        Intl.DateTimeFormat('en-US', { timeZone: timezone })
        return timezone
      } catch {
        return 'Asia/Seoul'
      }
    })()

    const [hours, minutes] = timeStr.split(':').map(Number)
    const localDateStr = now.toLocaleDateString('en-CA', { timeZone: safeTimezone })
    const localDateTimeStr = `${localDateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: safeTimezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    })

    const utcDate = new Date(localDateTimeStr + 'Z')
    const parts = formatter.formatToParts(utcDate)
    const getPart = (type: string) => parts.find(p => p.type === type)?.value || '0'
    const localOfUtc = new Date(
      `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:${getPart('second')}Z`
    )
    const offsetMs = localOfUtc.getTime() - utcDate.getTime()
    return new Date(localDateTimeStr + 'Z').getTime() - offsetMs
  } catch {
    // Fallback: treat as Asia/Seoul (UTC+9)
    const [hours, minutes] = timeStr.split(':').map(Number)
    const localDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    const dateMs = new Date(`${localDateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+09:00`).getTime()
    return dateMs
  }
}

// Fix 3: shouldSendHabitToday - remove dead code
/** 오늘 요일이 습관 frequency에 해당하는지 체크 */
function shouldSendHabitToday(
  frequency: string,
  frequencyConfig: Record<string, unknown>,
  timezone: string,
  now: Date
): boolean {
  if (frequency === 'daily') return true
  if (frequency === 'weekly') {
    const localDateStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
    const [y, m, d] = localDateStr.split('-').map(Number)
    const localDay = new Date(y, m - 1, d).getDay()
    const daysOfWeek = frequencyConfig?.days_of_week as number[] | undefined
    return daysOfWeek && Array.isArray(daysOfWeek) ? daysOfWeek.includes(localDay) : true
  }
  return true
}

// ─── Event Notifications ──────────────────────────────────────────

async function sendEventNotifications(
  now: Date,
  enabledUserIds: string[],
  subsByUser: ReturnType<typeof buildSubsByUser>
): Promise<{ sentCount: number; staleEndpoints: string[] }> {
  try {
    const nowMs = now.getTime()
    const maxReminderMin = 10080 // 1주
    const windowStart = new Date(nowMs - maxReminderMin * 60 * 1000)
    const windowEnd = new Date(nowMs + maxReminderMin * 60 * 1000 + 60000)
    const todayStr = now.toISOString().split('T')[0]

    const { data: events, error } = await supabaseAdmin
      .from('events')
      .select('id, user_id, title, start_at, reminder_mins')
      .not('reminder_mins', 'is', null)
      .in('user_id', enabledUserIds)
      .gte('start_at', windowStart.toISOString())
      .lte('start_at', windowEnd.toISOString())

    if (error) {
      console.error('Failed to fetch events:', error)
      return { sentCount: 0, staleEndpoints: [] }
    }
    if (!events || events.length === 0) return { sentCount: 0, staleEndpoints: [] }

    const notifications: { userId: string; payload: string }[] = []

    for (const event of events) {
      if (!event.reminder_mins || !Array.isArray(event.reminder_mins)) continue
      const eventStartMs = new Date(event.start_at).getTime()

      // Fix 5: Deduplicate reminder_mins
      const uniqueMins = [...new Set(event.reminder_mins as number[])]

      for (const reminderMin of uniqueMins) {
        const alarmTimeMs = eventStartMs - reminderMin * 60 * 1000
        if (nowMs >= alarmTimeMs && nowMs < alarmTimeMs + 60000) {
          const minutesUntil = Math.round((eventStartMs - nowMs) / 60000)
          const body = minutesUntil > 0 ? `${minutesUntil}분 후 시작됩니다` : '곧 시작됩니다'

          notifications.push({
            userId: event.user_id,
            payload: JSON.stringify({
              title: `🔔 ${event.title}`,
              body,
              icon: '/assets/icon-192x192.png',
              tag: `event-${event.id}-${reminderMin}-${todayStr}`,
              url: '/',
            }),
          })
        }
      }
    }

    return sendPushToUsers(subsByUser, notifications)
  } catch (err) {
    console.error('sendEventNotifications error:', err)
    return { sentCount: 0, staleEndpoints: [] }
  }
}

// ─── Habit Notifications ──────────────────────────────────────────

async function sendHabitNotifications(
  now: Date,
  enabledUserIds: string[],
  subsByUser: ReturnType<typeof buildSubsByUser>,
  userTimezones: Map<string, string>
): Promise<{ sentCount: number; staleEndpoints: string[] }> {
  try {
    const nowMs = now.getTime()
    const todayStr = now.toISOString().split('T')[0]

    const { data: habits, error } = await supabaseAdmin
      .from('habits')
      .select('id, user_id, title, reminder_time, frequency, frequency_config')
      .not('reminder_time', 'is', null)
      .eq('is_active', true)
      .in('user_id', enabledUserIds)

    if (error) {
      console.error('Failed to fetch habits:', error)
      return { sentCount: 0, staleEndpoints: [] }
    }
    if (!habits || habits.length === 0) return { sentCount: 0, staleEndpoints: [] }

    const notifications: { userId: string; payload: string }[] = []

    for (const habit of habits) {
      const timezone = userTimezones.get(habit.user_id) || 'Asia/Seoul'

      // frequency에 따라 오늘 발송 여부 체크
      if (!shouldSendHabitToday(habit.frequency, habit.frequency_config || {}, timezone, now)) {
        continue
      }

      const alarmTimeMs = localTimeToUtcMs(habit.reminder_time, timezone, now)

      if (nowMs >= alarmTimeMs && nowMs < alarmTimeMs + 60000) {
        notifications.push({
          userId: habit.user_id,
          payload: JSON.stringify({
            title: `🔔 ${habit.title}`,
            body: '습관을 실천할 시간입니다',
            icon: '/assets/icon-192x192.png',
            tag: `habit-${habit.id}-${todayStr}`,
            url: '/',
          }),
        })
      }
    }

    return sendPushToUsers(subsByUser, notifications)
  } catch (err) {
    console.error('sendHabitNotifications error:', err)
    return { sentCount: 0, staleEndpoints: [] }
  }
}

// ─── Todo Notifications ───────────────────────────────────────────

async function sendTodoNotifications(
  now: Date,
  enabledUserIds: string[],
  subsByUser: ReturnType<typeof buildSubsByUser>
): Promise<{ sentCount: number; staleEndpoints: string[] }> {
  try {
    const nowMs = now.getTime()
    const windowStart = new Date(nowMs)
    const windowEnd = new Date(nowMs + 60000)

    const { data: todos, error } = await supabaseAdmin
      .from('todos')
      .select('id, user_id, title, due_date, reminder_at')
      .not('reminder_at', 'is', null)
      .eq('is_completed', false)
      .in('user_id', enabledUserIds)
      .gte('reminder_at', windowStart.toISOString())
      .lt('reminder_at', windowEnd.toISOString())

    if (error) {
      console.error('Failed to fetch todos:', error)
      return { sentCount: 0, staleEndpoints: [] }
    }
    if (!todos || todos.length === 0) return { sentCount: 0, staleEndpoints: [] }

    // Fix 6: Track only successfully sent todo IDs
    let totalSent = 0
    const staleEndpoints: string[] = []
    const sentTodoIds: string[] = []

    for (const todo of todos) {
      const body = todo.due_date ? `마감일: ${todo.due_date}` : '리마인더'
      const result = await sendPushToUsers(subsByUser, [{
        userId: todo.user_id,
        payload: JSON.stringify({
          title: `📋 ${todo.title}`,
          body,
          icon: '/assets/icon-192x192.png',
          tag: `todo-${todo.id}`,
          url: '/',
        }),
      }])
      if (result.sentCount > 0) {
        sentTodoIds.push(todo.id)
      }
      totalSent += result.sentCount
      staleEndpoints.push(...result.staleEndpoints)
    }

    if (sentTodoIds.length > 0) {
      await supabaseAdmin
        .from('todos')
        .update({ reminder_at: null })
        .in('id', sentTodoIds)
    }

    return { sentCount: totalSent, staleEndpoints }
  } catch (err) {
    console.error('sendTodoNotifications error:', err)
    return { sentCount: 0, staleEndpoints: [] }
  }
}

// ─── Main Handler ─────────────────────────────────────────────────

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_CONTACT_EMAIL || 'noreply@time-pie.app'}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )

  const now = new Date()

  try {
    // 모든 푸시 구독 유저 조회
    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*')

    if (subError || !subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ events: 0, habits: 0, todos: 0 })
    }

    const allUserIds = [...new Set(subscriptions.map(s => s.user_id))]
    const subsByUser = buildSubsByUser(subscriptions)

    // 유저 설정 조회 (알림 on/off + timezone)
    const { data: settings } = await supabaseAdmin
      .from('user_settings')
      .select('user_id, notifications_events, notifications_todos, notifications_habits, timezone')
      .in('user_id', allUserIds)

    const settingsMap = new Map(
      (settings || []).map(s => [s.user_id, s])
    )

    // 각 알림 타입별 활성 유저 필터링 (설정 없는 유저는 기본 true)
    const eventUserIds = allUserIds.filter(id => {
      const s = settingsMap.get(id)
      return !s || s.notifications_events !== false
    })
    const habitUserIds = allUserIds.filter(id => {
      const s = settingsMap.get(id)
      return !s || s.notifications_habits !== false
    })
    const todoUserIds = allUserIds.filter(id => {
      const s = settingsMap.get(id)
      return !s || s.notifications_todos !== false
    })

    // 유저별 timezone 맵
    const userTimezones = new Map<string, string>()
    for (const id of allUserIds) {
      const s = settingsMap.get(id)
      userTimezones.set(id, s?.timezone || 'Asia/Seoul')
    }

    // Fix 7: Collect staleEndpoints from return values
    const [eventsResult, habitsResult, todosResult] = await Promise.all([
      eventUserIds.length > 0
        ? sendEventNotifications(now, eventUserIds, subsByUser)
        : Promise.resolve({ sentCount: 0, staleEndpoints: [] }),
      habitUserIds.length > 0
        ? sendHabitNotifications(now, habitUserIds, subsByUser, userTimezones)
        : Promise.resolve({ sentCount: 0, staleEndpoints: [] }),
      todoUserIds.length > 0
        ? sendTodoNotifications(now, todoUserIds, subsByUser)
        : Promise.resolve({ sentCount: 0, staleEndpoints: [] }),
    ])

    const staleEndpoints = [
      ...eventsResult.staleEndpoints,
      ...habitsResult.staleEndpoints,
      ...todosResult.staleEndpoints,
    ]

    // 만료된 구독 정리
    if (staleEndpoints.length > 0) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpoints)
    }

    return NextResponse.json({
      events: eventsResult.sentCount,
      habits: habitsResult.sentCount,
      todos: todosResult.sentCount,
      cleaned: staleEndpoints.length,
    })
  } catch (error) {
    console.error('Cron notify error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
