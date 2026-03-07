import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CalendarViewMode = 'week' | 'month'
type HomeViewMode = 'day' | 'week' | 'month'
type WeekStartDay = 0 | 1 // 0=일요일, 1=월요일

interface UIState {
  // 캘린더 페이지 뷰 모드
  calendarViewMode: CalendarViewMode
  setCalendarViewMode: (mode: CalendarViewMode) => void

  // 홈 페이지 뷰 모드 (일간/주간/월간)
  homeViewMode: HomeViewMode
  setHomeViewMode: (mode: HomeViewMode) => void

  // 주 시작일 (0=일요일, 1=월요일)
  weekStartDay: WeekStartDay
  setWeekStartDay: (day: WeekStartDay) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      calendarViewMode: 'month',
      setCalendarViewMode: (mode) => set({ calendarViewMode: mode }),

      homeViewMode: 'day',
      setHomeViewMode: (mode) => set({ homeViewMode: mode }),

      weekStartDay: 0,
      setWeekStartDay: (day) => set({ weekStartDay: day }),
    }),
    {
      name: 'time-pie-ui',
    }
  )
)
