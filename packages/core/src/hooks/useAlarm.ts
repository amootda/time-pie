import type { Event } from '@time-pie/supabase'
import dayjs from 'dayjs'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toDateString } from '../utils/date'

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

/** Notification API 또는 Service Worker 기반 알림이 가능한지 */
function checkNotificationSupport(): boolean {
    if (typeof window === 'undefined') return false
    // 일반 브라우저: Notification API 지원
    if ('Notification' in window) return true
    // iOS PWA 등: Service Worker + showNotification 만 지원
    if ('serviceWorker' in navigator) return true
    return false
}

/** 현재 알림 권한 상태를 통합적으로 확인 */
async function getPermissionState(): Promise<NotificationPermissionState> {
    // 일반 브라우저: Notification.permission 사용
    if ('Notification' in window) {
        return Notification.permission as NotificationPermissionState
    }
    // iOS PWA: PushManager의 permissionState로 확인
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.ready
            if (registration.pushManager) {
                const state = await registration.pushManager.permissionState({
                    userVisibleOnly: true,
                })
                return state as NotificationPermissionState
            }
        } catch {
            // permissionState 미지원 시 fallback
        }
    }
    return 'default'
}

/**
 * 이벤트의 알림 시간(reminder_min)에 따라 브라우저 알림을 스케줄링하는 hook.
 * 매 30초마다 현재 시간과 비교하여 알림을 발송합니다.
 *
 * iOS PWA에서는 Notification API가 없으므로 Service Worker의
 * showNotification()을 사용합니다.
 */
export function useAlarm({ events, enabled, selectedDate }: UseAlarmOptions): UseAlarmReturn {
    const [permission, setPermission] = useState<NotificationPermissionState>('default')
    const sentAlarmsRef = useRef<Set<string>>(new Set())
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const isSupported = typeof window !== 'undefined' && checkNotificationSupport()

    // 초기 권한 상태 동기화
    useEffect(() => {
        if (!isSupported) return
        getPermissionState().then(setPermission)
    }, [isSupported])

    // 날짜 변경 시 발송 기록 초기화
    useEffect(() => {
        sentAlarmsRef.current.clear()
    }, [selectedDate])

    const requestPermission = useCallback(async (): Promise<NotificationPermissionState> => {
        if (!isSupported) return 'denied'

        try {
            // 일반 브라우저
            if ('Notification' in window) {
                const result = await Notification.requestPermission()
                setPermission(result as NotificationPermissionState)
                return result as NotificationPermissionState
            }
            // iOS PWA: push subscribe 시 권한 요청이 함께 발생
            // 여기서는 현재 상태만 반환
            const state = await getPermissionState()
            setPermission(state)
            return state
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

        const showNotification = (title: string, options: NotificationOptions) => {
            // Service Worker 우선 (PWA 필수)
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready
                    .then((registration) => {
                        registration.showNotification(title, options)
                    })
                    .catch((e) => {
                        console.error('SW 알림 발송 실패:', e)
                    })
            } else if ('Notification' in window) {
                try {
                    new Notification(title, options)
                } catch (e) {
                    console.error('알림 발송 실패:', e)
                }
            }
        }

        const checkAlarms = () => {
            const now = new Date()
            const todayStr = toDateString(selectedDate)
            const nowStr = toDateString(now)

            // 오늘이 아닌 날짜의 이벤트는 알림하지 않음
            if (todayStr !== nowStr) return

            for (const event of events) {
                // reminder_min이 없으면 스킵
                if (event.reminder_min == null) continue

                // 이미 발송한 알림은 스킵
                const alarmKey = `${event.id}-${todayStr}`
                if (sentAlarmsRef.current.has(alarmKey)) continue

                // 이벤트 시작 시간 파싱
                const eventStart = dayjs(event.start_at)
                const startHour = eventStart.hour()
                const startMin = eventStart.minute()

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

                // 별도의 nowMs >= eventStartMs 검사(reminder_min=0일 때 무조건 스킵되는 버그 유발)를 제거합니다.

                if (isInAlarmWindow) {
                    const minutesUntil = Math.round((eventStartMs - nowMs) / 60000)
                    const body = minutesUntil > 0
                        ? `${minutesUntil}분 후 시작됩니다`
                        : '곧 시작됩니다'

                    showNotification(`🔔 ${event.title}`, {
                        body,
                        icon: '/assets/icon-192x192.png',
                        tag: alarmKey,
                        requireInteraction: true,
                    })

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
