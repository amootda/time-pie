'use client'

import type { EventPurpose, EventType } from '@time-pie/supabase'
import { EVENT_PURPOSES, getPurposesByType } from '@time-pie/core'

interface PurposeQuickSelectorProps {
  selectedPurpose: EventPurpose | null
  eventType: EventType
  onSelect: (purpose: EventPurpose) => void
  onShowAll?: () => void
}

/**
 * Quick purpose selector showing 4 most common purposes for the event type
 * with an optional "More" button to show all purposes
 */
export function PurposeQuickSelector({
  selectedPurpose,
  eventType,
  onSelect,
  onShowAll,
}: PurposeQuickSelectorProps) {
  // Get purposes filtered by event type
  const allPurposes = getPurposesByType(eventType)

  // Show first 4 purposes (most common)
  const quickPurposes = allPurposes.slice(0, 4)
  const hasMore = allPurposes.length > 4

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        약속 유형
      </label>
      <div className="grid grid-cols-5 gap-2">
        {quickPurposes.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => onSelect(p.key)}
            className={`flex flex-col items-center py-2.5 px-1 rounded-xl text-xs font-medium transition-all border-2 ${
              selectedPurpose === p.key
                ? 'border-primary bg-primary/10 text-primary dark:text-primary'
                : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300'
            }`}
          >
            <span className="text-lg mb-0.5">{p.emoji}</span>
            <span>{p.label}</span>
          </button>
        ))}

        {/* "More" button if there are additional purposes */}
        {hasMore && onShowAll && (
          <button
            type="button"
            onClick={onShowAll}
            className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs font-medium border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 transition-all"
          >
            <span className="text-lg mb-0.5">➕</span>
            <span>더보기</span>
          </button>
        )}
      </div>

      {/* Selected purpose indicator */}
      {selectedPurpose && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          선택됨: {EVENT_PURPOSES.find(p => p.key === selectedPurpose)?.label}
        </p>
      )}
    </div>
  )
}
