export interface Event {
  id: string
  title: string
  start_at: string
  end_at: string
  color: string
  category?: string
  event_type?: 'fixed' | 'flexible' | 'recurring'
}

export interface TimeSlice {
  startAngle: number
  endAngle: number
  event?: Event
  color: string
  isEmpty: boolean
  eventType?: 'fixed' | 'flexible' | 'recurring'
}

export interface PieChartProps {
  events: Event[]
  currentTime?: Date
  selectedDate?: Date
  size?: number
  showLabels?: boolean
  showCurrentTime?: boolean
  onEventClick?: (event: Event) => void
  onTimeSlotClick?: (hour: number) => void
  className?: string
}
