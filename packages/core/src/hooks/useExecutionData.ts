import { useCallback } from 'react'
import { useEventStore } from '../stores/eventStore'
import { useExecutionStore } from '../stores/executionStore'
import { useSuggestionStore } from '../stores/suggestionStore'
import { toDateString } from '../utils/date'
import {
    getExecutionsByDate,
    createExecution as createExecutionApi,
    completeExecution as completeExecutionApi,
    skipExecution as skipExecutionApi,
    getSuggestions as getSuggestionsApi,
    markSuggestionRead as markSuggestionReadApi,
    type EventExecution,
} from '@time-pie/supabase'

export interface UseExecutionDataReturn {
    isLoading: boolean
    startEventExecution: (eventId: string, plannedStart: string, plannedEnd: string) => Promise<EventExecution>
    completeEventExecution: (executionId: string) => Promise<EventExecution>
    skipEventExecution: (executionId: string) => Promise<EventExecution>
    markSuggestionAsRead: (id: string) => Promise<void>
    loadExecutions: (userId: string, date: Date) => Promise<EventExecution[]>
    loadSuggestions: (userId: string) => Promise<void>
}

export function useExecutionData(userId: string | undefined): UseExecutionDataReturn {
    const selectedDate = useEventStore((s) => s.selectedDate)

    const setExecutions = useExecutionStore((s) => s.setExecutions)
    const addExecution = useExecutionStore((s) => s.addExecution)
    const updateExecutionStore = useExecutionStore((s) => s.updateExecution)
    const setActiveExecution = useExecutionStore((s) => s.setActiveExecution)
    const setExecutionLoading = useExecutionStore((s) => s.setLoading)
    const executionLoading = useExecutionStore((s) => s.isLoading)

    const setSuggestions = useSuggestionStore((s) => s.setSuggestions)
    const markReadStore = useSuggestionStore((s) => s.markRead)
    const setSuggestionLoading = useSuggestionStore((s) => s.setLoading)
    const suggestionLoading = useSuggestionStore((s) => s.isLoading)

    const isLoading = executionLoading || suggestionLoading

    const loadExecutions = useCallback(
        async (uid: string, date: Date): Promise<EventExecution[]> => {
            setExecutionLoading(true)
            try {
                const executions = await getExecutionsByDate(uid, date)
                setExecutions(executions)
                return executions
            } catch (error) {
                console.error('Failed to load executions:', error)
                return []
            } finally {
                setExecutionLoading(false)
            }
        },
        [setExecutions, setExecutionLoading]
    )

    const loadSuggestions = useCallback(
        async (uid: string): Promise<void> => {
            setSuggestionLoading(true)
            try {
                const suggestions = await getSuggestionsApi(uid)
                setSuggestions(suggestions)
            } catch (error) {
                console.error('Failed to load suggestions:', error)
            } finally {
                setSuggestionLoading(false)
            }
        },
        [setSuggestions, setSuggestionLoading]
    )

    const startEventExecution = useCallback(
        async (eventId: string, plannedStart: string, plannedEnd: string): Promise<EventExecution> => {
            if (!userId) throw new Error('User not authenticated')
            const dateStr = toDateString(selectedDate)
            const execution = await createExecutionApi({
                event_id: eventId,
                user_id: userId,
                planned_start: plannedStart,
                planned_end: plannedEnd,
                actual_start: new Date().toISOString(),
                actual_end: null,
                status: 'in_progress',
                completion_rate: 0,
                date: dateStr,
                notes: null,
            })
            addExecution(execution)
            setActiveExecution(execution)
            return execution
        },
        [userId, selectedDate, addExecution, setActiveExecution]
    )

    const completeEventExecution = useCallback(
        async (executionId: string): Promise<EventExecution> => {
            const updated = await completeExecutionApi(executionId)
            updateExecutionStore(executionId, updated)
            setActiveExecution(null)
            return updated
        },
        [updateExecutionStore, setActiveExecution]
    )

    const skipEventExecution = useCallback(
        async (executionId: string): Promise<EventExecution> => {
            const updated = await skipExecutionApi(executionId)
            updateExecutionStore(executionId, updated)
            setActiveExecution(null)
            return updated
        },
        [updateExecutionStore, setActiveExecution]
    )

    const markSuggestionAsRead = useCallback(
        async (id: string): Promise<void> => {
            await markSuggestionReadApi(id)
            markReadStore(id)
        },
        [markReadStore]
    )

    return {
        isLoading,
        startEventExecution,
        completeEventExecution,
        skipEventExecution,
        markSuggestionAsRead,
        loadExecutions,
        loadSuggestions,
    }
}
