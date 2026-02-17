import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import dayjs from 'dayjs'

export async function GET(request: NextRequest) {
  try {
    // 1. 쿼리 파라미터 파싱
    const searchParams = request.nextUrl.searchParams
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    if (!yearParam || !monthParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: year and month' },
        { status: 400 }
      )
    }

    const year = parseInt(yearParam, 10)
    const month = parseInt(monthParam, 10)

    // 2. 파라미터 유효성 검증
    if (isNaN(year) || year < 1900 || year > 2100) {
      return NextResponse.json(
        { error: 'Invalid year. Must be between 1900 and 2100' },
        { status: 400 }
      )
    }

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: 'Invalid month. Must be between 1 and 12' },
        { status: 400 }
      )
    }

    // 3. Supabase 인증 (SSR 패턴)
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Route Handler에서 호출 시 무시
            }
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 4. 이벤트 조회 - 서버 supabase 클라이언트로 직접 쿼리
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59, 999)

    const start = dayjs(startDate).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
    const end = dayjs(endDate).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ')

    const { data: events, error: queryError } = await supabase
      .from('events')
      .select('id, title, start_at, end_at, event_type, purpose, color, repeat_days')
      .eq('user_id', user.id)
      .gte('start_at', start)
      .lte('start_at', end)
      .order('start_at', { ascending: true })

    if (queryError) {
      console.error('Supabase query error:', queryError)
      throw queryError
    }

    // 5. 응답 반환
    return NextResponse.json({
      events: events || [],
      month,
      year,
      count: events?.length || 0,
    })
  } catch (error) {
    console.error('Error fetching month events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
