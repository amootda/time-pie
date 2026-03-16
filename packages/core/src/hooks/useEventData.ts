import { useCallback } from 'react'
import { useEventStore } from '../stores/eventStore'
import {
    getEventsByDate,
    createEvent as createEventApi,
    updateEvent as updateEventApi,
    deleteEvent as deleteEventApi,
    type Event,
    type EventInsert,
} from '@time-pie/supabase'

export interface UseEventDataReturn {
    isLoading: boolean
    createEvent: (event: Omit<EventInsert, 'user_id'>) => Promise<Event>
    updateEvent: (id: string, updates: Partial<Event>) => Promise<Event>
    removeEvent: (id: string) => Promise<void>
    loadEvents: (userId: string, date: Date) => Promise<Event[]>
}

export function useEventData(userId: string | undefined): UseEventDataReturn {
    const setEvents = useEventStore((s) => s.setEvents)
    const addEvent = useEventStore((s) => s.addEvent)
    const updateEventStore = useEventStore((s) => s.updateEvent)
    const deleteEventStore = useEventStore((s) => s.deleteEvent)
    const setLoading = useEventStore((s) => s.setLoading)
    const setError = useEventStore((s) => s.setError)
    const isLoading = useEventStore((s) => s.isLoading)

    const loadEvents = useCallback(
        async (uid: string, date: Date): Promise<Event[]> => {
            setLoading(true)
            try {
                const events = await getEventsByDate(uid, date)
                setEvents(events)
                return events
            } catch (error) {
                console.error('Failed to load events:', error)
                setError('Failed to load events')
                return []
            } finally {
                setLoading(false)
            }
        },
        [setEvents, setLoading, setError]
    )

    const createEvent = useCallback(
        async (event: Omit<EventInsert, 'user_id'>): Promise<Event> => {
            if (!userId) throw new Error('User not authenticated')
            const newEvent = await createEventApi({ ...event, user_id: userId })
            addEvent(newEvent)
            return newEvent
        },
        [userId, addEvent]
    )

    const updateEvent = useCallback(
        async (id: string, updates: Partial<Event>): Promise<Event> => {
            const updated = await updateEventApi(id, updates, userId)
            updateEventStore(id, updated)
            return updated
        },
        [userId, updateEventStore]
    )

    const removeEvent = useCallback(
        async (id: string): Promise<void> => {
            await deleteEventApi(id, userId)
            deleteEventStore(id)
        },
        [userId, deleteEventStore]
    )

    return { isLoading, createEvent, updateEvent, removeEvent, loadEvents }
}
