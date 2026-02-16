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

const HOUR_LABELS = [6, 12, 18, 0]

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

          // Determine style based on event type
          const isAnchor = slice.eventType === 'anchor'
          const isHard = slice.eventType === 'hard'
          const isSoft = slice.eventType === 'soft'

          return (
            <g key={index} onClick={() => handleSliceClick(slice, hour)} className={slice.isEmpty ? 'text-foreground' : ''}>
              <path
                d={path}
                fill={slice.color}
                stroke={slice.isEmpty ? 'currentColor' : isSoft ? slice.color : 'currentColor'}
                strokeWidth={slice.isEmpty ? 2 : isHard ? 3 : isSoft ? 2 : 1}
                strokeDasharray={isSoft && !slice.isEmpty ? '6 3' : undefined}
                className={`transition-opacity ${
                  slice.isEmpty
                    ? 'opacity-30 hover:opacity-50'
                    : isAnchor
                      ? 'opacity-60 hover:opacity-75 cursor-pointer'
                      : isSoft
                        ? 'opacity-40 hover:opacity-60 cursor-pointer'
                        : 'opacity-100 hover:opacity-90 cursor-pointer'
                }`}
              />
            </g>
          )
        })}

        {/* 중앙 원 (현재 시간/활동 표시 영역) */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          className="fill-background"
          stroke="none"
        />

        {/* 중앙 텍스트 - 현재 시간과 활동 */}
        <text
          x={center}
          y={center - 30}
          textAnchor="middle"
          className="text-[10px] font-medium fill-muted-foreground uppercase tracking-wider"
        >
          CURRENT
        </text>
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          className="text-3xl font-bold fill-foreground"
          style={{ fontSize: '32px' }}
        >
          {currentTime.getHours().toString().padStart(2, '0')}:{currentTime.getMinutes().toString().padStart(2, '0')}
        </text>
        {/* 현재 진행 중인 이벤트 표시 */}
        {(() => {
          const currentHour = currentTime.getHours()
          const currentMinute = currentTime.getMinutes()
          const currentSlice = slices.find((slice) => {
            if (!slice.event) return false
            const startHour = Math.floor((slice.startAngle / 360) * 24)
            const endHour = Math.floor((slice.endAngle / 360) * 24)
            return currentHour >= startHour && currentHour < endHour
          })
          return currentSlice?.event ? (
            <text
              x={center}
              y={center + 25}
              textAnchor="middle"
              className="text-[11px] font-semibold fill-cyan-400 uppercase tracking-wide"
            >
              {currentSlice.event.title.length > 12
                ? currentSlice.event.title.slice(0, 12) + '...'
                : currentSlice.event.title}
            </text>
          ) : null
        })()}

        {/* 현재 시간 바늘 */}
        {showCurrentTime && (
          <g className="text-foreground">
            <line
              x1={center}
              y1={center}
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke="currentColor"
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle cx={center} cy={center} r={8} fill="currentColor" />
            <circle cx={needleEnd.x} cy={needleEnd.y} r={6} fill="currentColor" />
          </g>
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
                className="text-xs font-medium fill-muted-foreground"
              >
                {hour === 0 ? '00' : hour.toString().padStart(2, '0')}
              </text>
            )
          })}
      </svg>
    </div>
  )
}
