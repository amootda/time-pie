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
    return null
  }

  // Task: predefined purpose buttons
  const allPurposes = getPurposesByType(eventType)

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className={`flex flex-col items-center rounded-xl border-2 px-1 py-2.5 text-xs font-medium transition-all ${
                selectedPurpose === p.key
                  ? 'border-primary bg-primary/10 text-primary dark:text-primary'
                  : 'border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-600 dark:text-gray-400'
              }`}
            >
              {Icon && <Icon className="mb-1.5 h-5 w-5" />}
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
