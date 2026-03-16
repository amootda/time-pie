import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

/**
 * GET /api/cron/notify
 * pg_cron이 매분 호출. 알림 시간이 된 이벤트를 찾아 푸시 발송.
 */
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
  const nowMs = now.getTime()

  // 알림 윈도우: now ~ now+1분 사이에 알림이 울려야 하는 이벤트
  // 자정 전후 이벤트도 포함하기 위해, 현재 시간 기준 앞뒤 넉넉하게 조회
  const maxReminderMin = 60 // 최대 리마인더 분
  const windowStart = new Date(nowMs - maxReminderMin * 60 * 1000)
  const windowEnd = new Date(nowMs + maxReminderMin * 60 * 1000 + 60000)

  try {
    const { data: events, error: eventsError } = await getSupabaseAdmin()
      .from('events')
      .select('id, user_id, title, start_at, reminder_min')
      .not('reminder_min', 'is', null)
      .gte('start_at', windowStart.toISOString())
      .lte('start_at', windowEnd.toISOString())

    if (eventsError) {
      console.error('Failed to fetch events:', eventsError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    if (!events || events.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    // 현재 시간 기준 알림 대상 이벤트 필터링
    const targetEvents = events.filter((event) => {
      const eventStartMs = new Date(event.start_at).getTime()
      const alarmTimeMs = eventStartMs - (event.reminder_min * 60 * 1000)
      // 현재 분 윈도우 내에 알림 시간이 있는지
      return nowMs >= alarmTimeMs && nowMs < alarmTimeMs + 60000
    })

    if (targetEvents.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    // 대상 유저들의 푸시 구독 조회
    const userIds = [...new Set(targetEvents.map((e) => e.user_id))]
    const { data: subscriptions, error: subError } = await getSupabaseAdmin()
      .from('push_subscriptions')
      .select('*')
      .in('user_id', userIds)

    if (subError) {
      console.error('Failed to fetch subscriptions:', subError)
      return NextResponse.json({ error: 'DB error' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    // 유저별 구독 맵
    const subsByUser = new Map<string, typeof subscriptions>()
    for (const sub of subscriptions) {
      const list = subsByUser.get(sub.user_id) || []
      list.push(sub)
      subsByUser.set(sub.user_id, list)
    }

    // 푸시 발송
    let sentCount = 0
    const staleEndpoints: string[] = []
    const todayStr = now.toISOString().split('T')[0]

    for (const event of targetEvents) {
      const userSubs = subsByUser.get(event.user_id) || []
      const eventStartMs = new Date(event.start_at).getTime()
      const minutesUntil = Math.round((eventStartMs - nowMs) / 60000)
      const body =
        minutesUntil > 0 ? `${minutesUntil}분 후 시작됩니다` : '곧 시작됩니다'

      const payload = JSON.stringify({
        title: `🔔 ${event.title}`,
        body,
        icon: '/assets/icon-192x192.png',
        tag: `${event.id}-${todayStr}`,
        url: '/',
      })

      for (const sub of userSubs) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            payload
          )
          sentCount++
        } catch (err: unknown) {
          const statusCode = (err as { statusCode?: number })?.statusCode
          // 410 Gone / 404: 구독 만료 → 삭제
          if (statusCode === 410 || statusCode === 404) {
            staleEndpoints.push(sub.endpoint)
          } else {
            console.error(`Push failed for ${maskEndpoint(sub.endpoint)}:`, err)
          }
        }
      }
    }

    // 만료된 구독 정리
    if (staleEndpoints.length > 0) {
      await getSupabaseAdmin()
        .from('push_subscriptions')
        .delete()
        .in('endpoint', staleEndpoints)
    }

    return NextResponse.json({
      sent: sentCount,
      cleaned: staleEndpoints.length,
    })
  } catch (error) {
    console.error('Cron notify error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
