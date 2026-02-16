'use client'

import type { Event, EventType } from '@time-pie/supabase'
import { getPurposeInfo, getScheduleTypeInfo } from '@time-pie/core'

interface EventCardProps {
  event: Event
  onClick?: () => void
  onStartExecution?: () => void
}

const getTypeStyles = (eventType: EventType) => {
  switch (eventType) {
    case 'hard':
      return {
        label: 'HARD TASK',
        borderColor: 'border-l-blue-500',
        bgColor: 'bg-[#1A2B3F]',
        labelColor: 'text-blue-400',
        accentColor: 'bg-blue-500',
      }
    case 'anchor':
      return {
        label: 'ANCHOR',
        borderColor: 'border-l-gray-500',
        bgColor: 'bg-[#1A2B3F]',
        labelColor: 'text-gray-400',
        accentColor: 'bg-gray-500',
      }
    case 'soft':
      return {
        label: 'SOFT TASK',
        borderColor: 'border-l-yellow-500',
        bgColor: 'bg-[#1A2B3F]',
        labelColor: 'text-yellow-400',
        accentColor: 'bg-yellow-500',
      }
    default:
      return {
        label: 'TASK',
        borderColor: 'border-l-gray-500',
        bgColor: 'bg-[#1A2B3F]',
        labelColor: 'text-gray-400',
        accentColor: 'bg-gray-500',
      }
  }
}

export function EventCard({ event, onClick, onStartExecution }: EventCardProps) {
  const typeStyles = getTypeStyles(event.event_type)
  const purposeInfo = getPurposeInfo(event.purpose)

  const startTime = event.start_at.split('T')[1]?.slice(0, 5) || ''
  const endTime = event.end_at.split('T')[1]?.slice(0, 5) || ''
  const isSoftEvent = event.event_type === 'soft'

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStartExecution?.()
  }

  return (
    <div
      className={`w-full text-left p-4 rounded-2xl ${typeStyles.bgColor} border-l-4 ${typeStyles.borderColor} hover:bg-[#1F3347] transition-colors`}
    >
      <div className="flex items-start gap-4">
        {/* 좌측 색상 바 */}
        <div className={`w-1 h-16 rounded-full ${typeStyles.accentColor} flex-shrink-0`} />

        {/* 내용 */}
        <button
          onClick={onClick}
          className="flex-1 min-w-0 text-left"
        >
          <div className={`text-[10px] font-bold ${typeStyles.labelColor} uppercase tracking-wider mb-1`}>
            {typeStyles.label}
          </div>
          <h3 className="text-white text-lg font-bold mb-1 truncate">
            {event.title}
          </h3>
          {event.description && (
            <p className="text-gray-400 text-sm truncate">
              {event.description}
            </p>
          )}
          {event.location && (
            <p className="text-gray-500 text-xs mt-1 truncate">
              {event.location}
            </p>
          )}
        </button>

        {/* 우측: 시간 + 시작 버튼 */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-white text-2xl font-bold">
              {startTime}
            </div>
            <div className="text-gray-500 text-sm">
              {endTime}
            </div>
          </div>

          {/* Soft 이벤트만 시작 버튼 표시 */}
          {isSoftEvent && onStartExecution && (
            <button
              onClick={handleStartClick}
              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              시작
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
