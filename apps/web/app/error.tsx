'use client'

import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6">
            <div className="text-center max-w-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-6">
                    <AlertTriangle className="w-8 h-8 text-error" />
                </div>

                <h2 className="text-xl font-bold text-foreground mb-2">
                    오류가 발생했습니다
                </h2>
                <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
                    페이지를 불러오는 중 문제가 발생했습니다.<br />
                    잠시 후 다시 시도해주세요.
                </p>

                {error.digest && (
                    <p className="text-xs text-muted-foreground mb-4 font-mono">
                        ID: {error.digest}
                    </p>
                )}

                <div className="flex gap-3 justify-center w-full">
                    <button
                        onClick={reset}
                        className="flex-1 px-5 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        다시 시도
                    </button>
                    <Link
                        href="/"
                        className="flex-1 px-5 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                    >
                        <Home className="w-4 h-4" />
                        홈으로
                    </Link>
                </div>
            </div>
        </div>
    )
}
