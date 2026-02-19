import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import { Outfit, Noto_Sans_KR } from 'next/font/google'
import { AuthProvider, ThemeProvider, QueryProvider } from './providers'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FF6B35',
}

export const metadata: Metadata = {
  applicationName: 'Time Pie',
  title: {
    default: 'Time Pie - 시간을 파이처럼 관리하세요',
    template: '%s | Time Pie',
  },
  description:
    '일정, 할 일, 습관을 하나로 통합한 생산성 앱. 24시간 파이 차트로 하루를 한눈에.',
  manifest: '/manifest.json',
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
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value as 'light' | 'dark' | 'system' | undefined
  const theme = themeCookie || 'system'

  // 서버에서 dark class 결정: 'dark'일 때만 적용, 'system'은 클라이언트에서 처리
  const isDark = theme === 'dark'

  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${outfit.variable} ${notoSansKr.variable} ${isDark ? 'dark' : ''}`}
    >
      <body>
        <QueryProvider>
          <ThemeProvider initialTheme={theme}>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  )
}

