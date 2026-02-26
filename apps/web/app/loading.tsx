'use client'

import { PieChart } from 'lucide-react'

/**
 * Next.js 루트 로딩 UI
 * Header/BottomNav는 layout.tsx에서 관리하지 않으므로,
 * 각 페이지의 인라인 스켈레톤이 더 적절합니다.
 * 이 컴포넌트는 최소한의 피드백만 제공합니다.
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Minimal top bar placeholder */}
            <div className="pt-6 pb-4 max-w-lg mx-auto w-full px-6">
                <div className="animate-pulse space-y-2">
                    <div className="h-4 w-20 bg-muted rounded" />
                    <div className="h-9 w-28 bg-muted rounded" />
                </div>
            </div>

            {/* Content skeleton */}
            <div className="flex-1 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
                    <PieChart className="w-8 h-8 text-primary/80" />
                </div>
            </div>
        </div>
    )
}
