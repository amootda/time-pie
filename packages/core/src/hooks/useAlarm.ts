import { useEffect, useRef, useCallback, useState } from 'react'
import type { Event } from '@time-pie/supabase'

type NotificationPermissionState = 'default' | 'granted' | 'denied'

interface UseAlarmOptions {
    /** 오늘 표시할 이벤트 목록 */
    events: Event[]
    /** 설정에서 알림 활성화 여부 */
    enabled: boolean
    /** 선택된 날짜 */
    selectedDate: Date
}

interface UseAlarmReturn {
    /** 현재 브라우저 알림 권한 상태 */
    permission: NotificationPermissionState
    /** 알림 권한 요청 */
    requestPermission: () => Promise<NotificationPermissionState>
    /** 알림이 지원되는 브라우저인지 */
    isSupported: boolean
}

/**
 * 이벤트의 알림 시간(reminder_min)에 따라 브라우저 알림을 스케줄링하는 hook.
 * 매 30초마다 현재 시간과 비교하여 알림을 발송합니다.
 */
export function useAlarm({ events, enabled, selectedDate }: UseAlarmOptions): UseAlarmReturn {
    const [permission, setPermission] = useState<NotificationPermissionState>('default')
    const sentAlarmsRef = useRef<Set<string>>(new Set())
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const isSupported = typeof window !== 'undefined' && 'Notification' in window

    // 초기 권한 상태 동기화
    useEffect(() => {
        if (isSupported) {
            setPermission(Notification.permission as NotificationPermissionState)
        }
    }, [isSupported])

    // 날짜 변경 시 발송 기록 초기화
    useEffect(() => {
        sentAlarmsRef.current.clear()
    }, [selectedDate])

    const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
        if (!isSupported) return 'denied'

        try {
            const result = await Notification.requestPermission()
            setPermission(result as NotificationPermissionState)
            return result as NotificationPermissionState
        } catch {
            return 'denied'
        }
    }, [isSupported])

    // 알림 체크 로직
    useEffect(() => {
        if (!isSupported || !enabled || permission !== 'granted') {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        const checkAlarms = () => {
            const now = new Date()
            const todayStr = selectedDate.toISOString().split('T')[0]
            const nowStr = now.toISOString().split('T')[0]

            // 오늘이 아닌 날짜의 이벤트는 알림하지 않음
            if (todayStr !== nowStr) return

            for (const event of events) {
                // reminder_min이 없으면 스킵
                if (event.reminder_min == null) continue

                // 이미 발송한 알림은 스킵
                const alarmKey = `${event.id}-${todayStr}`
                if (sentAlarmsRef.current.has(alarmKey)) continue

                // 이벤트 시작 시간 파싱
                const startTimePart = event.start_at.split('T')[1]?.slice(0, 5) || '00:00'
                const [startHour, startMin] = startTimePart.split(':').map(Number)

                // 알림 시간 계산 (이벤트 시작 - reminder_min)
                const eventStartMs = new Date(
                    now.getFullYear(), now.getMonth(), now.getDate(),
                    startHour, startMin, 0
                ).getTime()
                const alarmTimeMs = eventStartMs - (event.reminder_min * 60 * 1000)
                const nowMs = now.getTime()

                // 알림 시간이 이미 지났고, 이벤트 시작 시간 이전인 경우 = 알림 발송 범위
                // 30초 간격 체크이므로 ±30초 윈도우 적용
                const isInAlarmWindow = nowMs >= alarmTimeMs && nowMs < alarmTimeMs + 60000

                // 이벤트 시작 시간이 이미 지난 경우는 알림하지 않음
                if (nowMs >= eventStartMs) continue

                if (isInAlarmWindow) {
                    const minutesUntil = Math.round((eventStartMs - nowMs) / 60000)
                    const body = minutesUntil > 0
                        ? `${minutesUntil}분 후 시작됩니다`
                        : '곧 시작됩니다'

                    try {
                        new Notification(`🔔 ${event.title}`, {
                            body,
                            icon: '/assets/icon-192x192.png',
                            tag: alarmKey,
                            requireInteraction: true,
                        })
                    } catch (e) {
                        console.error('알림 발송 실패:', e)
                    }

                    sentAlarmsRef.current.add(alarmKey)
                }
            }
        }

        // 즉시 1회 체크 + 30초 간격
        checkAlarms()
        intervalRef.current = setInterval(checkAlarms, 30000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }
    }, [isSupported, enabled, permission, events, selectedDate])

    return {
        permission,
        requestPermission,
        isSupported,
    }
}
