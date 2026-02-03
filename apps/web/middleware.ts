import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 공개 경로 - 인증 없이 접근 가능
const PUBLIC_PATHS = ['/login', '/auth/callback']

// 정적 파일 및 Next.js 내부 경로
const IGNORED_PATHS = ['/_next/', '/favicon.ico', '/api/']

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // 정적 파일 및 API 경로는 무시
    if (IGNORED_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // 공개 경로는 세션 체크 없이 통과
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    // Response 객체 생성
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Supabase 클라이언트 생성 (쿠키 동기화)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // 세션 확인
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 미인증 시 로그인 페이지로 리다이렉트
    if (!user) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
    }

    return response
}

export const config = {
    matcher: [
        /*
         * 다음을 제외한 모든 요청 경로에 적용:
         * - _next/static (정적 파일)
         * - _next/image (이미지 최적화)
         * - favicon.ico (파비콘)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
