import { useEffect, useCallback, useRef } from 'react'
import { useEventStore } from '../stores/eventStore'
import { useTodoStore } from '../stores/todoStore'
import { useHabitStore } from '../stores/habitStore'
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
    type Event,
    type Todo,
    type Habit,
    type EventInsert,
    type TodoInsert,
    type HabitInsert,
} from '@time-pie/supabase'

interface UseUserDataReturn {
    isLoading: boolean
    createEvent: (event: Omit<EventInsert, 'user_id'>) => Promise<Event>
    updateEvent: (id: string, updates: Partial<Event>) => Promise<Event>
    removeEvent: (id: string) => Promise<void>
    createTodo: (todo: Omit<TodoInsert, 'user_id'>) => Promise<Todo>
    updateTodo: (id: string, updates: Partial<Todo>) => Promise<Todo>
    removeTodo: (id: string) => Promise<void>
    toggleTodoComplete: (id: string) => Promise<Todo>
    createHabit: (habit: Omit<HabitInsert, 'user_id'>) => Promise<Habit>
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit>
    removeHabit: (id: string) => Promise<void>
    logHabit: (habitId: string, date: string) => Promise<void>
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

    const isLoading = eventLoading || todoLoading || habitLoading

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
                    thirtyDaysAgo.toISOString().split('T')[0],
                    today.toISOString().split('T')[0]
                )
                setLogs(logs)
            }
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
        setEventLoading,
        setTodoLoading,
        setHabitLoading,
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
                const events = await getEventsByDate(userId, selectedDate)
                setEvents(events)
            } catch (error) {
                console.error('Failed to load events:', error)
            } finally {
                setEventLoading(false)
            }
        }

        loadEvents()
    }, [userId, selectedDate, setEvents, setEventLoading])

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
        async (id: string): Promise<Todo> => {
            const updated = await toggleTodoApi(id)
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
            await logHabitApi(habitId, date)
            logHabitStore(habitId, date)
        },
        [logHabitStore]
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
        refreshData,
    }
}
