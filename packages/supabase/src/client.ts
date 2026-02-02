import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

// 환경변수가 없을 때 (빌드 시점 등) placeholder 클라이언트 생성
const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseUrl || !supabasePublishableKey) {
    // SSR/빌드 시점에는 placeholder 반환
    if (typeof window === 'undefined') {
      return createClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  }
  return createClient(supabaseUrl, supabasePublishableKey)
}

export const supabase = createSupabaseClient()

// 서버 사이드용 클라이언트 생성 함수
export function createServerClient(
  url: string,
  key: string
) {
  return createClient(url, key)
}
