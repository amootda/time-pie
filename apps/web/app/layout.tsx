import type { Metadata, Viewport } from 'next'
import { AuthProvider } from './providers'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FF6B35',
}

export const metadata: Metadata = {
  title: 'Time Pie - 시간을 파이처럼 관리하세요',
  description:
    '일정, 할 일, 습관을 하나로 통합한 생산성 앱. 24시간 파이 차트로 하루를 한눈에.',
  icons: {
    icon: '/assets/icon.png',
    apple: '/assets/apple-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Time Pie',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
