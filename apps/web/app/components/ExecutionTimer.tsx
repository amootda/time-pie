'use client'

import { useState, useEffect } from 'react'

interface ExecutionTimerProps {
  eventTitle: string
  startTime: Date
  onStop: () => void
  onSkip: () => void
}

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export function ExecutionTimer({ eventTitle, startTime, onStop, onSkip }: ExecutionTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const updateElapsed = () => {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 1000)
      setElapsed(Math.max(0, diff))
    }

    updateElapsed()
    const interval = setInterval(updateElapsed, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Pulsing indicator */}
          <div className="relative flex-shrink-0">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
          </div>

          {/* Event info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {eventTitle}
            </p>
            <p className="text-2xl font-mono font-bold text-primary tabular-nums">
              {formatElapsed(elapsed)}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onSkip}
              className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              건너뛰기
            </button>
            <button
              onClick={onStop}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors"
            >
              중지
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
