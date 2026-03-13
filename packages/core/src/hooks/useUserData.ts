import { useEffect, useCallback, useRef } from 'react'
import { useEventStore } from '../stores/eventStore'
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
    const prevDateRef = useRef<Date>(selectedDate)

    const refreshData = useCallback(async () => {
        if (!userId) return

        await Promise.all([
            eventData.loadEvents(userId, selectedDate),
            todoData.loadTodos(userId),
            habitData.loadHabits(userId),
        ])

        await Promise.all([
            executionData.loadExecutions(userId, selectedDate),
            executionData.loadSuggestions(userId),
        ])
    }, [userId, selectedDate, eventData, todoData, habitData, executionData])

    // Load data on mount, when userId changes, or when selected date changes
    useEffect(() => {
        if (!userId) return

        const userChanged = prevUserIdRef.current !== userId
        prevUserIdRef.current = userId

        if (userChanged || !initialLoadDone.current) {
            initialLoadDone.current = true
            prevDateRef.current = selectedDate
            refreshData()
            return
        }

        if (prevDateRef.current !== selectedDate) {
            prevDateRef.current = selectedDate
            eventData.loadEvents(userId, selectedDate)
            executionData.loadExecutions(userId, selectedDate)
        }
    }, [userId, selectedDate, refreshData, eventData, executionData])

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
