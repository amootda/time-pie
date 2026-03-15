/// <reference lib="webworker" />

interface PushData {
  title?: string
  body?: string
  icon?: string
  tag?: string
  url?: string
}

const sw = self as unknown as ServiceWorkerGlobalScope

// 서버에서 보낸 Push 메시지 수신
sw.addEventListener('push', (event: PushEvent) => {
  let data: PushData = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    // 잘못된 페이로드 무시
  }
  const title = data.title || '🔔 Time Pie'
  const options: NotificationOptions = {
    body: data.body || '',
    icon: data.icon || '/assets/icon-192x192.png',
    badge: '/assets/icon-192x192.png',
    tag: data.tag,
    data: { url: data.url || '/' },
    requireInteraction: true,
  }

  event.waitUntil(sw.registration.showNotification(title, options))
})

// 알림 클릭 시 앱 열기
sw.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url: string = event.notification.data?.url || '/'

  event.waitUntil(
    sw.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients: readonly WindowClient[]) => {
        // 이미 열려있는 탭이 있으면 포커스
        for (const client of clients) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus()
          }
        }
        // 없으면 새 탭 열기
        return sw.clients.openWindow(url)
      })
  )
})
