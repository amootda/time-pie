'use client'

import { useState } from 'react'
import Link from 'next/link'

interface HeaderProps {
  title?: string
  showDate?: boolean
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export function Header({ title = 'Time Pie', showDate = false, selectedDate, onDateChange }: HeaderProps) {
  const today = selectedDate || new Date()
  const formattedDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(today)

  const goToPrevDay = () => {
    if (onDateChange) {
      const prev = new Date(today)
      prev.setDate(prev.getDate() - 1)
      onDateChange(prev)
    }
  }

  const goToNextDay = () => {
    if (onDateChange) {
      const next = new Date(today)
      next.setDate(next.getDate() + 1)
      onDateChange(next)
    }
  }

  const goToToday = () => {
    if (onDateChange) {
      onDateChange(new Date())
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-card border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-primary">{title}</h1>
        <Link href="/settings" className="p-2 hover:bg-muted rounded-full transition-colors">
          <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </Link>
      </div>
      {showDate && (
        <div className="flex items-center justify-between px-4 pb-3 max-w-lg mx-auto">
          <button onClick={goToPrevDay} className="p-2 hover:bg-muted rounded-full">
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button onClick={goToToday} className="text-sm text-foreground/80 hover:text-primary transition-colors">
            {formattedDate}
          </button>
          <button onClick={goToNextDay} className="p-2 hover:bg-muted rounded-full">
            <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </header>
  )
}
