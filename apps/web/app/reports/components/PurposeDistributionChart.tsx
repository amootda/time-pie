'use client'

import { getPurposeInfo } from '@time-pie/core'
import { memo } from 'react'

interface PurposeDistributionChartProps {
  distribution: Record<string, number>
}

export const PurposeDistributionChart = memo(function PurposeDistributionChart({
  distribution,
}: PurposeDistributionChartProps) {
  const entries = Object.entries(distribution)
    .filter(([, min]) => min > 0)
    .sort((a, b) => b[1] - a[1])

  const total = entries.reduce((sum, [, min]) => sum + min, 0)
  if (total === 0) return null

  // SVG donut chart
  const size = 160
  const strokeWidth = 32
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  let offset = 0
  const segments = entries.map(([purpose, min]) => {
    const info = getPurposeInfo(purpose)
    const ratio = min / total
    const dashLength = circumference * ratio
    const segment = {
      purpose,
      label: info?.label || purpose,
      color: info?.color || '#7F8C8D',
      min,
      ratio,
      dashArray: `${dashLength} ${circumference - dashLength}`,
      dashOffset: -offset,
    }
    offset += dashLength
    return segment
  })

  return (
    <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
      <h3 className="font-bold text-foreground mb-4">유형별 시간 분포</h3>
      <div className="flex items-center gap-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          {segments.map((seg) => (
            <circle
              key={seg.purpose}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={seg.dashArray}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          ))}
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-lg font-bold"
          >
            {Math.floor(total / 60)}h
          </text>
        </svg>
        <div className="flex-1 space-y-2">
          {segments.map((seg) => (
            <div key={seg.purpose} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-sm text-foreground">{seg.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {Math.floor(seg.min / 60)}h {seg.min % 60}m
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})
