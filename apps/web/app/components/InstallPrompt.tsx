'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA 설치 유도 배너.
 * - Android/Desktop: beforeinstallprompt 이벤트 활용
 * - iOS: Safari에서 "홈 화면에 추가" 안내
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // 이미 설치된 경우 or 이전에 닫은 경우
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (localStorage.getItem('pwa-install-dismissed')) return

    // Android/Desktop: beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari 감지
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)
    if (isIOS && isSafari) {
      setShowIOSGuide(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    setDeferredPrompt(null)
    setShowIOSGuide(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (dismissed) return null
  if (!deferredPrompt && !showIOSGuide) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 mx-auto max-w-lg animate-slide-up">
      <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <span className="text-xl">📲</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground">앱으로 설치하기</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {showIOSGuide
                ? '하단의 공유 버튼 → "홈 화면에 추가"를 눌러주세요. 푸시 알림을 받을 수 있어요!'
                : '홈 화면에 추가하면 푸시 알림을 받을 수 있어요!'}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            설치하기
          </button>
        )}
      </div>
    </div>
  )
}
