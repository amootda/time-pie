import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Time Pie - 시간을 파이처럼 관리하세요',
  description:
    '일정, 할 일, 습관을 하나로 통합한 생산성 앱. 24시간 파이 차트로 하루를 한눈에.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
