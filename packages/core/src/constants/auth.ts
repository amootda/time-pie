/** 인증 없이 접근 가능한 공개 경로 */
export const PUBLIC_PATHS = ['/login', '/auth/callback']

/** 탭 복귀 시 세션 재검증 쓰로틀 간격 (ms) */
export const SESSION_CHECK_THROTTLE_MS = 30_000
