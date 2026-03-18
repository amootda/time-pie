import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

/**
 * 푸시 알림 시스템 진단 엔드포인트 (디버깅용)
 * GET /api/push/test → 서버 설정 확인
 * POST /api/push/test → 테스트 푸시 발송
 */

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const checks: Record<string, unknown> = {}

  // 1. 환경변수 확인
  checks.env = {
    VAPID_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    VAPID_PUBLIC_KEY_LENGTH: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.length ?? 0,
    VAPID_PRIVATE_KEY: !!process.env.VAPID_PRIVATE_KEY,
    VAPID_CONTACT_EMAIL: !!process.env.VAPID_CONTACT_EMAIL,
    CRON_SECRET: !!process.env.CRON_SECRET,
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  // 2. push_subscriptions 테이블 확인
  try {
    const { data, error, count } = await getSupabaseAdmin()
      .from('push_subscriptions')
      .select('user_id, endpoint', { count: 'exact' })

    checks.subscriptions = {
      count: count ?? data?.length ?? 0,
      error: error?.message ?? null,
      sample: data?.map(s => ({
        user_id: s.user_id.slice(0, 8) + '...',
        endpoint: s.endpoint.slice(0, 50) + '...',
      })) ?? [],
    }
  } catch (err) {
    checks.subscriptions = { error: String(err) }
  }

  // 3. user_settings 확인
  try {
    const { data, error } = await getSupabaseAdmin()
      .from('user_settings')
      .select('user_id, notifications_events, notifications_todos, notifications_habits, timezone')

    checks.settings = {
      count: data?.length ?? 0,
      error: error?.message ?? null,
      data: data?.map(s => ({
        user_id: s.user_id.slice(0, 8) + '...',
        events: s.notifications_events,
        todos: s.notifications_todos,
        habits: s.notifications_habits,
        timezone: s.timezone,
      })) ?? [],
    }
  } catch (err) {
    checks.settings = { error: String(err) }
  }

  // 4. VAPID 설정 유효성
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_CONTACT_EMAIL || 'noreply@time-pie.app'}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )
    checks.vapid = { valid: true }
  } catch (err) {
    checks.vapid = { valid: false, error: String(err) }
  }

  return NextResponse.json(checks)
}

/** POST: 테스트 푸시 발송 (모든 구독에) */
export async function POST() {
  try {
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_CONTACT_EMAIL || 'noreply@time-pie.app'}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!
    )

    const { data: subs, error } = await getSupabaseAdmin()
      .from('push_subscriptions')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!subs || subs.length === 0) {
      return NextResponse.json({ error: 'No subscriptions found', count: 0 })
    }

    const results = []
    for (const sub of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: '🧪 테스트 알림',
            body: `테스트 성공! (${new Date().toLocaleTimeString('ko-KR', { timeZone: 'Asia/Seoul' })})`,
            icon: '/assets/icon-192x192.png',
            tag: 'test-notification',
            url: '/',
          })
        )
        results.push({ endpoint: sub.endpoint.slice(0, 50), status: 'sent' })
      } catch (err: unknown) {
        results.push({
          endpoint: sub.endpoint.slice(0, 50),
          status: 'failed',
          error: String(err),
          statusCode: (err as { statusCode?: number })?.statusCode,
        })
      }
    }

    return NextResponse.json({ sent: results.length, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
