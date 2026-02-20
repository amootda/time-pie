'use client'

import { getPurposesByType } from '@time-pie/core'
import type { EventType } from '@time-pie/supabase'
import { PURPOSE_ICONS } from './constants'

interface PurposeQuickSelectorProps {
  selectedPurpose: string | null
  eventType: EventType
  onSelect: (purpose: string) => void
  onShowAll?: () => void
}

/**
 * Purpose selector with dual mode:
 * - anchor: free-text input for custom purpose
 * - task: predefined 5 purpose buttons
 */
export function PurposeQuickSelector({
  selectedPurpose,
  eventType,
  onSelect,
  onShowAll,
}: PurposeQuickSelectorProps) {
  // Anchor: free-text input
  if (eventType === 'anchor') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          유형
        </label>
        <input
          type="text"
          value={selectedPurpose || ''}
          onChange={(e) => onSelect(e.target.value)}
          placeholder="예: 수면, 아침식사, 점심식사, 저녁식사..."
          className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
      </div>
    )
  }

  // Task: predefined purpose buttons
  const allPurposes = getPurposesByType(eventType)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        할일 유형
      </label>
      <div className="grid grid-cols-5 gap-2">
        {allPurposes.map((p) => {
          const Icon = PURPOSE_ICONS[p.key]
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => onSelect(p.key)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-medium transition-all border-2 ${selectedPurpose === p.key
                ? 'border-primary bg-primary/10 text-primary dark:text-primary'
                : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
                }`}
            >
              {Icon && <Icon className="w-5 h-5 mb-1.5" />}
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
