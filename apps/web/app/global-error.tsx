'use client'

import { AlertOctagon, RefreshCw } from 'lucide-react'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="ko">
            <body className="min-h-screen flex items-center justify-center bg-background px-6">
                <div className="text-center p-8 max-w-md flex flex-col items-center">
                    <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <AlertOctagon className="w-10 h-10 text-error" />
                    </div>

                    <h1 className="text-2xl font-bold text-foreground mb-2">
                        알 수 없는 오류가 발생했습니다
                    </h1>
                    <p className="text-muted-foreground mb-8 text-sm">
                        앱을 실행하는 도중 치명적인 오류가 발생했습니다.<br />
                        문제가 지속되면 관리자에게 문의해주세요.
                    </p>

                    {error.digest && (
                        <p className="text-xs text-muted-foreground mb-6 font-mono bg-muted py-1 px-2 rounded">
                            Error ID: {error.digest}
                        </p>
                    )}

                    <button
                        onClick={reset}
                        className="w-full px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <RefreshCw className="w-5 h-5" />
                        앱 다시 시작하기
                    </button>
                </div>
            </body>
        </html>
    )
}
