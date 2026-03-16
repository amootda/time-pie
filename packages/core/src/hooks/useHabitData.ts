import { useCallback } from 'react'
import { useHabitStore } from '../stores/habitStore'
import { toDateString } from '../utils/date'
import {
    getHabits,
    getHabitLogs,
    createHabit as createHabitApi,
    updateHabit as updateHabitApi,
    deleteHabit as deleteHabitApi,
    logHabitCompletion as logHabitApi,
    type Habit,
    type HabitInsert,
} from '@time-pie/supabase'

export interface UseHabitDataReturn {
    isLoading: boolean
    createHabit: (habit: Omit<HabitInsert, 'user_id'>) => Promise<Habit>
    updateHabit: (id: string, updates: Partial<Habit>) => Promise<Habit>
    removeHabit: (id: string) => Promise<void>
    logHabit: (habitId: string, date: string) => Promise<void>
    loadHabits: (userId: string) => Promise<Habit[]>
}

export function useHabitData(userId: string | undefined): UseHabitDataReturn {
    const setHabits = useHabitStore((s) => s.setHabits)
    const setLogs = useHabitStore((s) => s.setLogs)
    const addHabit = useHabitStore((s) => s.addHabit)
    const updateHabitStore = useHabitStore((s) => s.updateHabit)
    const deleteHabitStore = useHabitStore((s) => s.deleteHabit)
    const logHabitStore = useHabitStore((s) => s.logHabit)
    const setLoading = useHabitStore((s) => s.setLoading)
    const setError = useHabitStore((s) => s.setError)
    const isLoading = useHabitStore((s) => s.isLoading)

    const loadHabits = useCallback(
        async (uid: string): Promise<Habit[]> => {
            setLoading(true)
            try {
                const habits = await getHabits(uid)
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

                return habits
            } catch (error) {
                console.error('Failed to load habits:', error)
                setError('Failed to load habits')
                return []
            } finally {
                setLoading(false)
            }
        },
        [setHabits, setLogs, setLoading, setError]
    )

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

    return { isLoading, createHabit, updateHabit, removeHabit, logHabit, loadHabits }
}
