'use client'

import * as HoverCard from '@radix-ui/react-hover-card'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
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
  showCenterInfo = true,
  onEventClick,
  onTimeSlotClick,
  className = '',
}: PieChartProps) {
  const center = size / 2
  const outerRadius = size / 2 - 10
  const innerRadius = outerRadius * 0.35
  const labelRadius = outerRadius + 20

  const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null)

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
      <HoverCard.Root openDelay={0} closeDelay={100}>
        <svg
          width={size + 50}
          height={size + 50}
          viewBox={`-25 -25 ${size + 50} ${size + 50}`}
          className="overflow-visible"
        >
          {/* 파이 조각들 */}
          {slices.map((slice, index) => {
            const isHovered = hoveredSliceIndex === index
            // 호버 시 살짝 크기를 키우기 위해 반지름 증가
            const activeRadius = isHovered && !slice.isEmpty ? outerRadius + 8 : outerRadius
            const path = describeArc(
              center,
              center,
              activeRadius,
              slice.startAngle,
              slice.endAngle
            )
            const midAngle = (slice.startAngle + slice.endAngle) / 2
            const hour = Math.floor((midAngle / 360) * 24)

            // Determine style based on event type
            const isAnchor = slice.eventType === 'anchor'

            return (
              <HoverCard.Root key={`${slice.event?.id || index}-${slice.startAngle}`} openDelay={0} closeDelay={50}>
                <HoverCard.Trigger asChild>
                  <motion.g
                    onClick={() => handleSliceClick(slice, hour)}
                    className={slice.isEmpty ? 'text-foreground' : 'cursor-pointer'}
                    onMouseEnter={() => setHoveredSliceIndex(index)}
                    onMouseLeave={() => setHoveredSliceIndex(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleSliceClick(slice, hour)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-disabled={slice.isEmpty}
                    aria-label={
                      slice.event
                        ? `${slice.event.title} event`
                        : `Empty time slot at ${hour}:00`
                    }
                    style={{
                      transformOrigin: `${center}px ${center}px`,
                      outline: 'none'
                    }}
                  >
                    <motion.path
                      d={path}
                      fill={slice.color}
                      stroke={slice.isEmpty ? 'currentColor' : 'currentColor'}
                      strokeWidth={slice.isEmpty ? 2 : isAnchor ? 1 : 2}
                      initial={false}
                      animate={{
                        d: path,
                        opacity: slice.isEmpty ? 0.3 : isAnchor ? 0.6 : isHovered ? 1 : 0.9,
                        filter: isHovered && !slice.isEmpty ? 'drop-shadow(0px 4px 12px rgba(0,0,0,0.3))' : 'none'
                      }}
                      transition={{ duration: 0.3 }}
                      className="focus-visible:stroke-4"
                    />
                  </motion.g>
                </HoverCard.Trigger>
                
                {/* HoverCard Content For Event Slices */}
                {!slice.isEmpty && slice.event && (
                  <HoverCard.Portal>
                    <HoverCard.Content
                      side="top"
                      align="center"
                      sideOffset={5}
                      className="z-50 w-64 rounded-xl border border-border bg-popover/95 p-4 text-popover-foreground shadow-lg backdrop-blur-sm outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
                    >
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: slice.event.color }}
                          />
                          <h4 className="font-semibold leading-none truncate">{slice.event.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                           {/* 타임존 등이 포함된 ISO 형식을 브라우저 로컬 기준으로 잘라 표시 (HH:MM - HH:MM) */}
                          {new Date(slice.event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - {' '}
                          {new Date(slice.event.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </p>
                      </div>
                      <HoverCard.Arrow className="fill-popover/95" />
                    </HoverCard.Content>
                  </HoverCard.Portal>
                )}
              </HoverCard.Root>
            )
          })}

          {/* 중앙 원 (현재 시간/활동 표시 영역) */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            className="fill-background/90 backdrop-blur-sm"
            stroke="none"
          />

          {/* 중앙 텍스트 - 현재 시간과 활동 */}
          {showCenterInfo && (
            <g>
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
                const currentSlice = slices.find((slice) => {
                  if (!slice.event) return false

                  let startTime = dayjs(slice.event.start_at)
                  let endTime = dayjs(slice.event.end_at)
                  let now = dayjs(currentTime)

                  // 자정을 넘어가는 경우 처리 (end < start)
                  if (endTime.isBefore(startTime)) {
                    // endTime에 1일 추가하여 다음 날로 정규화
                    endTime = endTime.add(1, 'day')
                    // now가 startTime보다 이전이면 now도 1일 추가
                    if (now.isBefore(startTime)) {
                      now = now.add(1, 'day')
                    }
                  }

                  // 일반적인 범위 체크: start <= current < end
                  return (now.isAfter(startTime) || now.isSame(startTime)) && now.isBefore(endTime)
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
            </g>
          )}

          {/* 현재 시간 바늘 */}
          {showCurrentTime && (
            <g className="text-foreground pointer-events-none">
              <motion.line
                x1={center}
                y1={center}
                x2={needleEnd.x}
                y2={needleEnd.y}
                stroke="currentColor"
                strokeWidth={4}
                strokeLinecap="round"
                initial={false}
                animate={{ x2: needleEnd.x, y2: needleEnd.y }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              />
              <circle cx={center} cy={center} r={8} fill="currentColor" />
              <motion.circle 
                cx={needleEnd.x} 
                cy={needleEnd.y} 
                r={6} 
                fill="currentColor" 
                initial={false}
                animate={{ cx: needleEnd.x, cy: needleEnd.y }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              />
            </g>
          )}

          {/* 시간 레이블 */}
          {showLabels &&
            HOUR_LABELS.map((hour, i) => {
              const pos = getHourLabelPosition(hour, center, center, labelRadius)
              return (
                <text
                  key={hour}
                  x={pos.x}
                  y={pos.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-muted-foreground pointer-events-none"
                >
                  {hour === 0 ? '00' : hour.toString().padStart(2, '0')}
                </text>
              )
            })}
        </svg>
      </HoverCard.Root>
    </div>
  )
}
