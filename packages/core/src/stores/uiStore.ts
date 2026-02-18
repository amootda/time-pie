import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CalendarViewMode = 'week' | 'month'
type HomeViewMode = 'day' | 'week' | 'month'

interface UIState {
  // 캘린더 페이지 뷰 모드
  calendarViewMode: CalendarViewMode
  setCalendarViewMode: (mode: CalendarViewMode) => void

  // 홈 페이지 뷰 모드 (일간/주간/월간)
  homeViewMode: HomeViewMode
  setHomeViewMode: (mode: HomeViewMode) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      calendarViewMode: 'month',
      setCalendarViewMode: (mode) => set({ calendarViewMode: mode }),

      homeViewMode: 'day',
      setHomeViewMode: (mode) => set({ homeViewMode: mode }),
    }),
    {
      name: 'time-pie-ui',
    }
  )
)
