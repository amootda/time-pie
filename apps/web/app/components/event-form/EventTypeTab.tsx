'use client'

import { SCHEDULE_TYPES } from '@time-pie/core'
import type { EventType } from '@time-pie/supabase'
import { SCHEDULE_TYPE_ICONS } from './constants'

interface EventTypeTabProps {
  selectedType: EventType
  onSelect: (type: EventType) => void
}

/**
 * Tab component for selecting event type (anchor, hard, soft)
 * Extracted from EventModal for reusability
 */
export function EventTypeTab({ selectedType, onSelect }: EventTypeTabProps) {
  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
      {SCHEDULE_TYPES.map((type) => {
        const Icon = SCHEDULE_TYPE_ICONS[type.key]
        return (
          <button
            key={type.key}
            type="button"
            onClick={() => onSelect(type.key)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${selectedType === type.key
              ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <div>{type.label}</div>
          </button>
        )
      })}
    </div>
  )
}
