import { useEffect, useCallback, useRef } from 'react'
import { useEventStore } from '../stores/eventStore'
import { toDateString } from '../utils/date'
import { useEventData, type UseEventDataReturn } from './useEventData'
import { useTodoData, type UseTodoDataReturn } from './useTodoData'
import { useHabitData, type UseHabitDataReturn } from './useHabitData'
import { useExecutionData, type UseExecutionDataReturn } from './useExecutionData'

type UseUserDataReturn = {
    isLoading: boolean
    refreshData: () => Promise<void>
} & Omit<UseEventDataReturn, 'isLoading' | 'loadEvents'>
  & Omit<UseTodoDataReturn, 'isLoading' | 'loadTodos'>
  & Omit<UseHabitDataReturn, 'isLoading' | 'loadHabits'>
  & Omit<UseExecutionDataReturn, 'isLoading' | 'loadExecutions' | 'loadSuggestions'>

export function useUserData(userId: string | undefined): UseUserDataReturn {
    const selectedDate = useEventStore((s) => s.selectedDate)

    const eventData = useEventData(userId)
    const todoData = useTodoData(userId)
    const habitData = useHabitData(userId)
    const executionData = useExecutionData(userId)

    const isLoading = eventData.isLoading || todoData.isLoading || habitData.isLoading || executionData.isLoading

    const initialLoadDone = useRef(false)
    const prevUserIdRef = useRef<string | undefined>(undefined)
    const prevDateStrRef = useRef<string>(toDateString(selectedDate))

    // Extract stable function refs to avoid refreshData re-creation
    const loadEventsRef = useRef(eventData.loadEvents)
    const loadTodosRef = useRef(todoData.loadTodos)
    const loadHabitsRef = useRef(habitData.loadHabits)
    const loadExecutionsRef = useRef(executionData.loadExecutions)
    const loadSuggestionsRef = useRef(executionData.loadSuggestions)
    loadEventsRef.current = eventData.loadEvents
    loadTodosRef.current = todoData.loadTodos
    loadHabitsRef.current = habitData.loadHabits
    loadExecutionsRef.current = executionData.loadExecutions
    loadSuggestionsRef.current = executionData.loadSuggestions

    const refreshData = useCallback(async () => {
        if (!userId) return

        await Promise.all([
            loadEventsRef.current(userId, selectedDate),
            loadTodosRef.current(userId),
            loadHabitsRef.current(userId),
        ])

        await Promise.all([
            loadExecutionsRef.current(userId, selectedDate),
            loadSuggestionsRef.current(userId),
        ])
    }, [userId, selectedDate])

    // Load data on mount, when userId changes, or when selected date changes
    useEffect(() => {
        if (!userId) return

        const userChanged = prevUserIdRef.current !== userId
        prevUserIdRef.current = userId

        if (userChanged || !initialLoadDone.current) {
            initialLoadDone.current = true
            prevDateStrRef.current = toDateString(selectedDate)
            refreshData()
            return
        }

        const currentDateStr = toDateString(selectedDate)
        if (prevDateStrRef.current !== currentDateStr) {
            prevDateStrRef.current = currentDateStr
            loadEventsRef.current(userId, selectedDate)
            loadExecutionsRef.current(userId, selectedDate)
        }
    }, [userId, selectedDate, refreshData])

    return {
        isLoading,
        refreshData,
        createEvent: eventData.createEvent,
        updateEvent: eventData.updateEvent,
        removeEvent: eventData.removeEvent,
        createTodo: todoData.createTodo,
        updateTodo: todoData.updateTodo,
        removeTodo: todoData.removeTodo,
        toggleTodoComplete: todoData.toggleTodoComplete,
        createHabit: habitData.createHabit,
        updateHabit: habitData.updateHabit,
        removeHabit: habitData.removeHabit,
        logHabit: habitData.logHabit,
        startEventExecution: executionData.startEventExecution,
        completeEventExecution: executionData.completeEventExecution,
        skipEventExecution: executionData.skipEventExecution,
        markSuggestionAsRead: executionData.markSuggestionAsRead,
    }
}
