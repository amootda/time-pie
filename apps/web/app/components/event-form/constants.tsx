import type { EventPurpose, EventType } from '@time-pie/supabase'
import {
    Anchor,
    BookOpen,
    Briefcase,
    Calendar,
    CheckSquare,
    Dumbbell,
    LucideIcon,
    Pin
} from 'lucide-react'

export const SCHEDULE_TYPE_ICONS: Record<EventType, LucideIcon> = {
    anchor: Anchor,
    task: CheckSquare,
}

export const PURPOSE_ICONS: Record<EventPurpose, LucideIcon> = {
    work: Briefcase,
    appointment: Calendar,
    exercise: Dumbbell,
    study: BookOpen,
    other: Pin,
}
