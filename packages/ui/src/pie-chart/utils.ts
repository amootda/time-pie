import type { Event, TimeSlice } from './types'

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
  return (totalMinutes / (24 * 60)) * 360
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
    startAngle: timeToAngle(new Date(event.start_at)),
    endAngle: timeToAngle(new Date(event.end_at)),
    event,
    color: event.color,
    isEmpty: false,
  }
}

/**
 * 이벤트 배열을 파이 조각 배열로 변환 (빈 시간대 포함)
 */
export function eventsToSlices(events: Event[]): TimeSlice[] {
  if (events.length === 0) {
    return [
      {
        startAngle: 0,
        endAngle: 360,
        color: '#E5E7EB',
        isEmpty: true,
      },
    ]
  }

  // 시작 시간순 정렬
  const sorted = [...events].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  )

  const slices: TimeSlice[] = []
  let currentAngle = 0

  for (const event of sorted) {
    const eventStart = timeToAngle(new Date(event.start_at))
    const eventEnd = timeToAngle(new Date(event.end_at))

    // 빈 시간대 추가
    if (eventStart > currentAngle) {
      slices.push({
        startAngle: currentAngle,
        endAngle: eventStart,
        color: '#E5E7EB',
        isEmpty: true,
      })
    }

    // 이벤트 추가
    slices.push(eventToSlice(event))
    currentAngle = eventEnd
  }

  // 마지막 빈 시간대
  if (currentAngle < 360) {
    slices.push({
      startAngle: currentAngle,
      endAngle: 360,
      color: '#E5E7EB',
      isEmpty: true,
    })
  }

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
