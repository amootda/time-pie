import { useEffect, useCallback, useRef } from 'react'
import { useEventStore } from '../stores/eventStore'
import { useTodoStore } from '../stores/todoStore'
import { useHabitStore } from '../stores/habitStore'
import { useExecutionStore } from '../stores/executionStore'
import { useSuggestionStore } from '../stores/suggestionStore'
import { toDateString } from '../utils/date'
import {
    getEventsByDate,
    createEvent as createEventApi,
    updateEvent as updateEventApi,
    deleteEvent as deleteEventApi,
    getTodos,
    createTodo as createTodoApi,
    updateTodo as updateTodoApi,
    deleteTodo as deleteTodoApi,
    toggleTodoComplete as toggleTodoApi,
    getHabits,
    getHabitLogs,
    createHabit as createHabitApi,
    updateHabit as updateHabitApi,
    deleteHabit as deleteHabitApi,
    logHabitCompletion as logHabitApi,
    getExecutionsByDate,
    createExecution as createExecutionApi,
    startExecution as startExecutionApi,
    completeExecution as completeExecutionApi,
    skipExecution as skipExecutionApi,
    getSuggestions as getSuggestionsApi,
    markSuggestionRead as markSuggestionReadApi,
    type Event,
    type Todo,
    type Habit,
    type EventInsert,
    type TodoInsert,
    type HabitInsert,
    type EventExecution,
    type EventExecutionInsert,
    type AISuggestion,
} from '@time-pie/supabase'

interface UseUserDataReturn {
    isLoading: boolean
    createEvent: (event: Omit<EventInsert, 'user_id'>) => Promise<Event>
    updateEvent: (id: string, updates: Partial<Event>) => Promise<Event>
    removeEvent: (id: string) => Promise<void>
    createTodo: (todo: Omit<TodoInsert, 'user_id'>) => Promise<Todo>
    updateTodo: (id: string, updates: Partial<Todo>) => Promise<Todo>
    removeTodo: (id: string) => Promise<void>
    toggleTodoComplete: (id: string, currentIsCompleted: boolean) => Promise<Todo>
    createHabit: (habit: Omit<HabitInsert, 'user_id'>) => Promise<Habit>
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit>
    removeHabit: (id: string) => Promise<void>
    logHabit: (habitId: string, date: string) => Promise<void>
    startEventExecution: (eventId: string, plannedStart: string, plannedEnd: string) => Promise<EventExecution>
    completeEventExecution: (executionId: string) => Promise<EventExecution>
    skipEventExecution: (executionId: string) => Promise<EventExecution>
    markSuggestionAsRead: (id: string) => Promise<void>
    refreshData: () => Promise<void>
}

export function useUserData(userId: string | undefined): UseUserDataReturn {
    // Get individual actions from stores to avoid dependency issues
    const selectedDate = useEventStore((s) => s.selectedDate)
    const setEvents = useEventStore((s) => s.setEvents)
    const addEvent = useEventStore((s) => s.addEvent)
    const updateEventStore = useEventStore((s) => s.updateEvent)
    const deleteEventStore = useEventStore((s) => s.deleteEvent)
    const setEventLoading = useEventStore((s) => s.setLoading)
    const setEventError = useEventStore((s) => s.setError)
    const eventLoading = useEventStore((s) => s.isLoading)

    const setTodos = useTodoStore((s) => s.setTodos)
    const addTodo = useTodoStore((s) => s.addTodo)
    const updateTodoStore = useTodoStore((s) => s.updateTodo)
    const deleteTodoStore = useTodoStore((s) => s.deleteTodo)
    const setTodoLoading = useTodoStore((s) => s.setLoading)
    const setTodoError = useTodoStore((s) => s.setError)
    const todoLoading = useTodoStore((s) => s.isLoading)

    const setHabits = useHabitStore((s) => s.setHabits)
    const setLogs = useHabitStore((s) => s.setLogs)
    const addHabit = useHabitStore((s) => s.addHabit)
    const updateHabitStore = useHabitStore((s) => s.updateHabit)
    const deleteHabitStore = useHabitStore((s) => s.deleteHabit)
    const logHabitStore = useHabitStore((s) => s.logHabit)
    const setHabitLoading = useHabitStore((s) => s.setLoading)
    const setHabitError = useHabitStore((s) => s.setError)
    const habitLoading = useHabitStore((s) => s.isLoading)

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

    const isLoading = eventLoading || todoLoading || habitLoading || executionLoading || suggestionLoading

    // Use ref to track if initial load has happened
    const initialLoadDone = useRef(false)

    // Load initial data
    const refreshData = useCallback(async () => {
        if (!userId) return

        try {
            setEventLoading(true)
            setTodoLoading(true)
            setHabitLoading(true)

            const [events, todos, habits] = await Promise.all([
                getEventsByDate(userId, selectedDate),
                getTodos(userId),
                getHabits(userId),
            ])

            setEvents(events)
            setTodos(todos)
            setHabits(habits)

            if (habits.length > 0) {
                const today = new Date()
                const thirtyDaysAgo = new Date(today)
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

                const logs = await getHabitLogs(
                    habits.map((h) => h.id),
                    toDateString(thirtyDaysAgo),
                    toDateString(today)
                )
                setLogs(logs)
            }

            // Load executions for selected date
            const dateExecs = await getExecutionsByDate(userId, selectedDate)
            setExecutions(dateExecs)

            // Load suggestions
            const suggestions = await getSuggestionsApi(userId)
            setSuggestions(suggestions)
        } catch (error) {
            console.error('Failed to load data:', error)
            setEventError('Failed to load events')
            setTodoError('Failed to load todos')
            setHabitError('Failed to load habits')
        } finally {
            setEventLoading(false)
            setTodoLoading(false)
            setHabitLoading(false)
        }
    }, [
        userId,
        selectedDate,
        setEvents,
        setTodos,
        setHabits,
        setLogs,
        setExecutions,
        setSuggestions,
        setEventLoading,
        setTodoLoading,
        setHabitLoading,
        setExecutionLoading,
        setSuggestionLoading,
        setEventError,
        setTodoError,
        setHabitError,
    ])

    // Load data on mount and when userId changes
    useEffect(() => {
        if (userId && !initialLoadDone.current) {
            initialLoadDone.current = true
            refreshData()
        }
    }, [userId, refreshData])

    // Reset initial load flag when userId changes
    useEffect(() => {
        initialLoadDone.current = false
    }, [userId])

    // Reload events when selected date changes
    useEffect(() => {
        if (!userId || !initialLoadDone.current) return

        const loadEvents = async () => {
            try {
                setEventLoading(true)
                setExecutionLoading(true)
                const [events, executions] = await Promise.all([
                    getEventsByDate(userId, selectedDate),
                    getExecutionsByDate(userId, selectedDate),
                ])
                setEvents(events)
                setExecutions(executions)
            } catch (error) {
                console.error('Failed to load events:', error)
            } finally {
                setEventLoading(false)
                setExecutionLoading(false)
            }
        }

        loadEvents()
    }, [userId, selectedDate, setEvents, setExecutions, setEventLoading, setExecutionLoading])

    // Event CRUD
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
            const updated = await updateEventApi(id, updates)
            updateEventStore(id, updated)
            return updated
        },
        [updateEventStore]
    )

    const removeEvent = useCallback(
        async (id: string): Promise<void> => {
            await deleteEventApi(id)
            deleteEventStore(id)
        },
        [deleteEventStore]
    )

    // Todo CRUD
    const createTodo = useCallback(
        async (todo: Omit<TodoInsert, 'user_id'>): Promise<Todo> => {
            if (!userId) throw new Error('User not authenticated')
            const newTodo = await createTodoApi({ ...todo, user_id: userId })
            addTodo(newTodo)
            return newTodo
        },
        [userId, addTodo]
    )

    const updateTodo = useCallback(
        async (id: string, updates: Partial<Todo>): Promise<Todo> => {
            const updated = await updateTodoApi(id, updates)
            updateTodoStore(id, updated)
            return updated
        },
        [updateTodoStore]
    )

    const removeTodo = useCallback(
        async (id: string): Promise<void> => {
            await deleteTodoApi(id)
            deleteTodoStore(id)
        },
        [deleteTodoStore]
    )

    const toggleTodoComplete = useCallback(
        async (id: string, currentIsCompleted: boolean): Promise<Todo> => {
            const updated = await toggleTodoApi(id, currentIsCompleted)
            updateTodoStore(id, updated)
            return updated
        },
        [updateTodoStore]
    )

    // Habit CRUD
    const createHabit = useCallback(
        async (habit: Omit<HabitInsert, 'user_id'>): Promise<Habit> => {
            if (!userId) throw new Error('User not authenticated')
            const newHabit = await createHabitApi({ ...habit, user_id: userId })
            addHabit(newHabit)
            return newHabit
        },
        [userId, addHabit]
    )

    const updateHabit = useCallback(
        async (id: string, updates: Partial<Habit>): Promise<Habit> => {
            const updated = await updateHabitApi(id, updates)
            updateHabitStore(id, updated)
            return updated
        },
        [updateHabitStore]
    )

    const removeHabit = useCallback(
        async (id: string): Promise<void> => {
            await deleteHabitApi(id)
            deleteHabitStore(id)
        },
        [deleteHabitStore]
    )

    const logHabit = useCallback(
        async (habitId: string, date: string): Promise<void> => {
            // 낙관적 업데이트: 스토어 먼저 반영
            logHabitStore(habitId, date)
            try {
                await logHabitApi(habitId, date)
            } catch (error) {
                // 실패 시 롤백 (토글 되돌리기)
                logHabitStore(habitId, date)
                throw error
            }
        },
        [logHabitStore]
    )

    // Execution CRUD
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

    // Suggestion actions
    const markSuggestionAsRead = useCallback(
        async (id: string): Promise<void> => {
            await markSuggestionReadApi(id)
            markReadStore(id)
        },
        [markReadStore]
    )

    return {
        isLoading,
        createEvent,
        updateEvent,
        removeEvent,
        createTodo,
        updateTodo,
        removeTodo,
        toggleTodoComplete,
        createHabit,
        updateHabit,
        removeHabit,
        logHabit,
        startEventExecution,
        completeEventExecution,
        skipEventExecution,
        markSuggestionAsRead,
        refreshData,
    }
}
