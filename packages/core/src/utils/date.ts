import dayjs from 'dayjs'

/**
 * 날짜를 한국어 형식으로 포맷
 * @example formatDate(new Date()) // "2024년 1월 15일"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * 시간을 HH:MM 형식으로 포맷
 * @example formatTime(new Date()) // "14:30"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**
 * 상대적인 날짜 표시
 * @example formatRelativeDate(new Date()) // "오늘"
 */
export function formatRelativeDate(date: Date): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const target = new Date(date)
  target.setHours(0, 0, 0, 0)

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '내일'
  if (diffDays === -1) return '어제'
  if (diffDays > 0 && diffDays <= 7) return `${diffDays}일 후`
  if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}일 전`

  return formatDate(date)
}

/**
 * 요일 반환
 */
export function getDayName(date: Date): string {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return days[date.getDay()]
}

/**
 * 오늘 날짜인지 확인
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * 날짜를 YYYY-MM-DD 형식으로 변환 (로컬 타임존 기준)
 */
export function toDateString(date: Date = new Date()): string {
  return dayjs(date).format('YYYY-MM-DD')
}

/**
 * DB의 UTC ISO 문자열에서 로컬 타임존 기준 시간(HH:mm 혹은 직접 포맷)을 추출합니다.
 */
export function getLocalTimeFromISO(isoString: string, format: string = 'HH:mm'): string {
  if (!isoString) return ''
  return dayjs(isoString).format(format)
}

/**
 * DB의 UTC ISO 문자열 시간과 특정 날짜 문자열(YYYY-MM-DD)이
 * 사용자 로컬 타임존 기준으로 같은 날짜인지 확인합니다.
 */
export function isSameLocalDate(isoString: string, dateString: string): boolean {
  if (!isoString || !dateString) return false
  return dayjs(isoString).format('YYYY-MM-DD') === dateString
}
