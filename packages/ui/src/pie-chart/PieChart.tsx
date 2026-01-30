'use client'

import { useMemo } from 'react'
import type { PieChartProps } from './types'
import {
  describeArc,
  eventsToSlices,
  getHourLabelPosition,
  polarToCartesian,
  timeToAngle,
} from './utils'

const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21]

export function PieChart({
  events,
  currentTime = new Date(),
  selectedDate = new Date(),
  size = 300,
  showLabels = true,
  showCurrentTime = true,
  onEventClick,
  onTimeSlotClick,
  className = '',
}: PieChartProps) {
  const center = size / 2
  const outerRadius = size / 2 - 10
  const innerRadius = outerRadius * 0.35
  const labelRadius = outerRadius + 20

  const slices = useMemo(() => eventsToSlices(events), [events])

  const currentTimeAngle = useMemo(
    () => timeToAngle(currentTime),
    [currentTime]
  )

  const handleSliceClick = (slice: (typeof slices)[0], hour: number) => {
    if (slice.event && onEventClick) {
      onEventClick(slice.event)
    } else if (slice.isEmpty && onTimeSlotClick) {
      onTimeSlotClick(hour)
    }
  }

  // 현재 시간 바늘 좌표
  const needleEnd = polarToCartesian(center, center, outerRadius - 5, currentTimeAngle)

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        width={size + 50}
        height={size + 50}
        viewBox={`-25 -25 ${size + 50} ${size + 50}`}
      >
        {/* 파이 조각들 */}
        {slices.map((slice, index) => {
          const path = describeArc(
            center,
            center,
            outerRadius,
            slice.startAngle,
            slice.endAngle
          )
          const midAngle = (slice.startAngle + slice.endAngle) / 2
          const hour = Math.floor((midAngle / 360) * 24)

          return (
            <path
              key={index}
              d={path}
              fill={slice.color}
              stroke="white"
              strokeWidth={2}
              className={`transition-opacity ${
                slice.isEmpty
                  ? 'opacity-30 hover:opacity-50'
                  : 'opacity-90 hover:opacity-100 cursor-pointer'
              }`}
              onClick={() => handleSliceClick(slice, hour)}
            />
          )
        })}

        {/* 중앙 원 (날짜 표시 영역) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="white"
          stroke="#E5E7EB"
          strokeWidth={1}
        />

        {/* 중앙 텍스트 */}
        <text
          x={center}
          y={center - 10}
          textAnchor="middle"
          className="text-sm font-medium fill-foreground"
        >
          {selectedDate.getMonth() + 1}/{selectedDate.getDate()}
        </text>
        <text
          x={center}
          y={center + 10}
          textAnchor="middle"
          className="text-xs fill-foreground/60"
        >
          {['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()]}요일
        </text>

        {/* 현재 시간 바늘 */}
        {showCurrentTime && (
          <>
            <line
              x1={center}
              y1={center}
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke="#FF6B35"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={center} cy={center} r={6} fill="#FF6B35" />
          </>
        )}

        {/* 시간 레이블 */}
        {showLabels &&
          HOUR_LABELS.map((hour) => {
            const pos = getHourLabelPosition(hour, center, center, labelRadius)
            return (
              <text
                key={hour}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs fill-foreground/50"
              >
                {hour}
              </text>
            )
          })}
      </svg>
    </div>
  )
}
