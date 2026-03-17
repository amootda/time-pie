'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    __swRegistration?: Promise<ServiceWorkerRegistration>
  }
}

export function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.__swRegistration = navigator.serviceWorker.register('/sw.js')
      window.__swRegistration.catch((err) => {
        console.error('[SW] registration failed:', err)
      })
    }
  }, [])

  return null
}
