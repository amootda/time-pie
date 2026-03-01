'use client'

import { useRef } from 'react'

interface ColorPickerProps {
  selectedColor: string
  onColorChange: (color: string) => void
  showLabel?: boolean
}

// 15 preset colors — rainbow order (ROYGBIV → neutrals)
const PRESET_COLORS: { color: string; label?: string; emoji?: string }[] = [
  { color: '#E74C3C', label: '운동', emoji: '🏃' },  // red
  { color: '#FF5722' },                               // deep orange
  { color: '#E67E22', label: '약속', emoji: '📅' },  // orange
  { color: '#F1C40F' },                               // yellow
  { color: '#2ECC71' },                               // green
  { color: '#1ABC9C' },                               // teal
  { color: '#4A90D9', label: '업무', emoji: '💼' },  // blue
  { color: '#3498DB', label: '공부', emoji: '📚' },  // blue (lighter)
  { color: '#9B59B6' },                               // purple
  { color: '#E91E63' },                               // pink
  { color: '#607D8B' },                               // blue-gray
  { color: '#795548' },                               // brown
  { color: '#7F8C8D', label: '기타', emoji: '📌' },  // gray
  { color: '#95A5A6' },                               // light gray
  { color: '#34495E' },                               // dark
]

export function ColorPicker({
  selectedColor,
  onColorChange,
  showLabel = true,
}: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const normalizedSelected = selectedColor.toUpperCase()
  const isCustom = !PRESET_COLORS.some(
    (p) => p.color.toUpperCase() === normalizedSelected
  )

  return (
    <div>
      {showLabel && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            색상
          </span>
        </div>
      )}

      {/* Color swatch grid: 15 presets + 1 custom = 16, 8 cols × 2 rows */}
      <div
        role="radiogroup"
        aria-label="색상 선택"
        className="grid grid-cols-8 gap-1.5"
      >
        {PRESET_COLORS.map(({ color, label, emoji }) => {
          const isSelected = normalizedSelected === color.toUpperCase()
          const ariaLabel = label ? `${emoji ?? ''} ${label}`.trim() : color

          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={ariaLabel}
              title={ariaLabel}
              onClick={() => onColorChange(color)}
              className={`relative h-8 w-full rounded-full transition-opacity duration-150 ${
                isSelected
                  ? 'ring-2 ring-inset ring-white/70'
                  : 'opacity-75 hover:opacity-100'
              }`}
              style={{ backgroundColor: color }}
            >
              {isSelected && (
                <svg
                  className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )
        })}

        {/* Custom color — rainbow swatch → opens native color picker */}
        <button
          type="button"
          role="radio"
          aria-checked={isCustom}
          aria-label="직접 색상 선택"
          title="직접 선택"
          onClick={() => inputRef.current?.click()}
          className={`relative h-8 w-full overflow-hidden rounded-full transition-opacity duration-150 ${
            isCustom
              ? 'ring-2 ring-inset ring-white/70'
              : 'opacity-75 hover:opacity-100'
          }`}
          style={isCustom ? { backgroundColor: selectedColor } : undefined}
        >
          {isCustom ? (
            <svg
              className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background:
                  'conic-gradient(from 0deg, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)',
              }}
              aria-hidden="true"
            />
          )}
        </button>

        {/* Hidden native color input */}
        <input
          ref={inputRef}
          type="color"
          value={selectedColor}
          onChange={(e) => onColorChange(e.target.value.toUpperCase())}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
