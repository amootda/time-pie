import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('=== AUTH CALLBACK HIT ===')
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'
  console.log('Code:', code ? 'exists' : 'null', 'RedirectTo:', redirectTo)

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback error:', error)
      // 에러 발생 시 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login?error=auth_failed', requestUrl.origin))
    }

    // 세션 확인 로깅
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Session after exchange:', session ? 'exists' : 'null', session?.user?.email)
  }

  // 리다이렉트 목적지로 이동
  return NextResponse.redirect(new URL(redirectTo, requestUrl.origin))
}
