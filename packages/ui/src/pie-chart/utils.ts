import type { Event, TimeSlice } from './types'

/**
 * ISO 문자열을 로컬 시간으로 파싱
 * "2024-02-16T12:00:00" 또는 "2024-02-16T12:00:00.000Z"을 UTC가 아닌 로컬 시간으로 해석
 */
function parseLocalDateTime(isoString: string): Date {
  // Remove milliseconds and timezone suffix (.000Z, +00:00, etc.)
  const cleanDatetime = isoString.replace(/(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, '')
  const [date, time] = cleanDatetime.split('T')
  const [year, month, day] = date.split('-').map(Number)
  const [hours, minutes, seconds = 0] = time.split(':').map(Number)
  const result = new Date(year, month - 1, day, hours, minutes, seconds)

  console.log(`📅 parseLocalDateTime: "${isoString}" → ${result.toLocaleString('ko-KR')} (${hours}:${minutes})`)

  return result
}

/**
 * 시간을 각도로 변환
 * 0시(자정) = 0도 (상단)
 * 6시 = 90도 (우측)
 * 12시(정오) = 180도 (하단)
 * 18시 = 270도 (좌측)
 */
export function timeToAngle(date: Date): number {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const totalMinutes = hours * 60 + minutes
  const angle = (totalMinutes / (24 * 60)) * 360

  console.log(`⏰ timeToAngle: ${hours}:${minutes.toString().padStart(2, '0')} → ${angle.toFixed(1)}°`)

  return angle
}

/**
 * 각도를 시간으로 변환
 */
export function angleToTime(angle: number, baseDate: Date): Date {
  const normalizedAngle = ((angle % 360) + 360) % 360
  const totalMinutes = (normalizedAngle / 360) * 24 * 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  const result = new Date(baseDate)
  result.setHours(hours, minutes, 0, 0)
  return result
}

/**
 * 각도를 SVG arc path의 좌표로 변환
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  // SVG는 3시 방향이 0도이므로, 12시 방향을 0도로 만들기 위해 -90도 회전
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

/**
 * SVG arc path 생성
 */
export function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(x, y, radius, endAngle)
  const end = polarToCartesian(x, y, radius, startAngle)

  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M',
    x,
    y,
    'L',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    'Z',
  ].join(' ')
}

/**
 * 이벤트를 파이 조각으로 변환
 */
export function eventToSlice(event: Event): TimeSlice {
  return {
    startAngle: timeToAngle(parseLocalDateTime(event.start_at)),
    endAngle: timeToAngle(parseLocalDateTime(event.end_at)),
    event,
    color: event.color,
    isEmpty: false,
    eventType: event.event_type,
  }
}

/**
 * 이벤트 배열을 파이 조각 배열로 변환 (이벤트만 표시, 빈 시간대 제거)
 */
export function eventsToSlices(events: Event[]): TimeSlice[] {
  console.log('🔧 eventsToSlices input:', events)

  // 이벤트가 없으면 빈 배열 반환 (완전히 빈 파이차트)
  if (events.length === 0) {
    console.log('⚠️ No events, returning empty array')
    return []
  }

  // 시작 시간순 정렬
  const sorted = [...events].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )

  // 이벤트만 슬라이스로 변환 (빈 시간대 없음)
  const slices: TimeSlice[] = sorted.map(event => {
    const eventStart = timeToAngle(parseLocalDateTime(event.start_at))
    const eventEnd = timeToAngle(parseLocalDateTime(event.end_at))

    console.log(`📍 Event "${event.title}": start=${eventStart}°, end=${eventEnd}°`)

    return eventToSlice(event)
  })

  console.log('✅ eventsToSlices output:', slices)
  return slices
}

/**
 * 시간 레이블 위치 계산
 */
export function getHourLabelPosition(
  hour: number,
  centerX: number,
  centerY: number,
  radius: number
): { x: number; y: number } {
  const angle = (hour / 24) * 360
  return polarToCartesian(centerX, centerY, radius, angle)
}
