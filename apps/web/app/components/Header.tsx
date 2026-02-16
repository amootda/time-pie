'use client'

import Link from 'next/link'

interface HeaderProps {
  title?: string
  showDate?: boolean
  selectedDate?: Date
  onDateChange?: (date: Date) => void
}

export function Header({ title = 'Time Pie', showDate = false, selectedDate, onDateChange }: HeaderProps) {
  const today = selectedDate || new Date()

  // 요일과 날짜 포맷
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today)
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(today)
  const day = today.getDate()

  // 주간 날짜 생성 (월~금)
  const getWeekDates = () => {
    const dates = []
    const currentDay = today.getDay() // 0=일, 1=월, ..., 6=토
    const diff = currentDay === 0 ? -6 : 1 - currentDay // 월요일까지의 차이

    for (let i = 0; i < 5; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + diff + i)
      dates.push(date)
    }
    return dates
  }

  const weekDates = getWeekDates()

  const handleDateClick = (date: Date) => {
    if (onDateChange) {
      onDateChange(date)
    }
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear()
  }

  return (
    <header className="sticky top-0 z-10 bg-background pt-6 pb-4">
      <div className="max-w-lg mx-auto px-6">
        {/* 날짜와 설정 */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-muted-foreground text-sm font-medium mb-1">{weekday}</div>
            <div className="text-foreground text-4xl font-bold tracking-tight">
              {month} {day}
            </div>
          </div>
          <Link
            href="/settings"
            className="p-2.5 hover:bg-white/5 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
          </Link>
        </div>

        {/* 주간 날짜 선택기 */}
        {showDate && (
          <div className="flex gap-2">
            {weekDates.map((date, index) => {
              const isSelected = isSameDay(date, today)
              const dayShort = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)
              const dayNum = date.getDate()

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`flex-1 py-3 px-2 rounded-2xl transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-white'
                      : 'bg-card text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <div className={`text-xs font-medium mb-1 ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                    {dayShort}
                  </div>
                  <div className={`text-xl font-bold ${isSelected ? 'text-white' : 'text-foreground'}`}>
                    {dayNum}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </header>
  )
}
