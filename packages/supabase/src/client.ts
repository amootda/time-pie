import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// 브라우저 환경에서 쿠키 기반 Supabase 클라이언트 생성 (lazy initialization)
let _supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (_supabase) return _supabase

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. ' +
      'Ensure environment variables are set before accessing the Supabase client.'
    )
  }

  // 브라우저에서는 쿠키 기반 클라이언트 사용 (미들웨어와 세션 동기화)
  if (typeof window !== 'undefined') {
    _supabase = createBrowserClient(supabaseUrl, supabasePublishableKey)
  } else {
    _supabase = createClient(supabaseUrl, supabasePublishableKey)
  }

  return _supabase
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

// 서버 사이드용 클라이언트 생성 함수
export function createServerClient(
  url: string,
  key: string
) {
  return createClient(url, key)
}
