import { useCallback, useEffect, useState } from 'react'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/** SW ready를 타임아웃 포함하여 안전하게 가져오기 */
function getServiceWorkerRegistration(
  timeoutMs = 3000
): Promise<ServiceWorkerRegistration | null> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ])
}

interface UsePushNotificationOptions {
  userId: string | undefined
}

interface UsePushNotificationReturn {
  /** Push API 지원 여부 (SW + PushManager + SW 등록됨) */
  isSupported: boolean
  /** 현재 푸시 구독 중인지 */
  isSubscribed: boolean
  /** 푸시 구독 */
  subscribe: () => Promise<boolean>
  /** 푸시 구독 해제 */
  unsubscribe: () => Promise<void>
  /** 로딩 상태 */
  loading: boolean
}

/**
 * Web Push 구독을 관리하는 hook.
 * Service Worker + Push API를 사용하여 서버 푸시를 구독/해제합니다.
 */
export function usePushNotification({
  userId,
}: UsePushNotificationOptions): UsePushNotificationReturn {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [loading, setLoading] = useState(false)

  const vapidPublicKey =
    typeof window !== 'undefined'
      ? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
      : ''

  // SW 등록 여부 확인 + 기존 구독 상태 확인
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    getServiceWorkerRegistration().then((registration) => {
      if (!registration) return // SW 미등록 (개발 모드 등)
      setIsSupported(true)
      registration.pushManager.getSubscription().then((sub) => {
        setIsSubscribed(!!sub)
      })
    })
  }, [])

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported || !userId || !vapidPublicKey) return false

    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false

      const registration = await getServiceWorkerRegistration()
      if (!registration) return false

      const keyArray = urlBase64ToUint8Array(vapidPublicKey)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: keyArray.buffer as ArrayBuffer,
      })

      // 서버에 구독 정보 저장
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userId,
        }),
      })

      if (!res.ok) throw new Error('Failed to save subscription')

      setIsSubscribed(true)
      return true
    } catch (error) {
      console.error('Push subscription failed:', error)
      return false
    } finally {
      setLoading(false)
    }
  }, [isSupported, userId, vapidPublicKey])

  const unsubscribe = useCallback(async () => {
    if (!isSupported || !userId) return

    setLoading(true)
    try {
      const registration = await getServiceWorkerRegistration()
      if (!registration) return

      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            userId,
          }),
        })
      }
      setIsSubscribed(false)
    } catch (error) {
      console.error('Push unsubscribe failed:', error)
    } finally {
      setLoading(false)
    }
  }, [isSupported, userId])

  return { isSupported, isSubscribed, subscribe, unsubscribe, loading }
}
