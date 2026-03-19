import { create } from 'zustand'

interface ReportState {
  selectedWeekStart: string | null
  setSelectedWeekStart: (weekStart: string | null) => void
}

export const useReportStore = create<ReportState>((set) => ({
  selectedWeekStart: null,
  setSelectedWeekStart: (weekStart) => set({ selectedWeekStart: weekStart }),
}))
