// Time Pie Service Worker - Push Notification Handler

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data?.json() ?? {}
  } catch {
    // 잘못된 페이로드 무시
  }
  const title = data.title || '🔔 Time Pie'
  const options = {
    body: data.body || '',
    icon: data.icon || '/assets/icon-192x192.png',
    badge: '/assets/icon-192x192.png',
    tag: data.tag,
    data: { url: data.url || '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          try {
            const clientUrl = new URL(client.url)
            if (clientUrl.origin === self.location.origin && clientUrl.pathname === url && 'focus' in client) {
              return client.focus()
            }
          } catch {
            // invalid URL, skip
          }
        }
        return self.clients.openWindow(url)
      })
  )
})
