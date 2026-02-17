'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../providers'

export default function LoginPage() {
    const { user, loading, signInWithKakao, signInWithGoogle } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    // 이미 로그인된 경우 홈으로 리다이렉트
    useEffect(() => {
        if (!loading && user) {
            router.replace('/')
        }
    }, [user, loading, router])

    const handleKakaoLogin = async () => {
        setIsLoggingIn(true)
        try {
            await signInWithKakao()
        } catch (error) {
            console.error('Kakao login failed:', error)
            setIsLoggingIn(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoggingIn(true)
        try {
            await signInWithGoogle()
        } catch (error) {
            console.error('Google login failed:', error)
            setIsLoggingIn(false)
        }
    }

    // 로딩 중 표시
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    // 이미 로그인된 경우 리다이렉트 중
    if (user) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            <div className="max-w-md w-full mx-4">
                {/* 로고 및 타이틀 */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-lg shadow-indigo-500/25">
                        <svg
                            className="w-10 h-10 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Time Pie</h1>
                    <p className="text-gray-400">시간을 파이처럼 관리하세요</p>
                </div>

                {/* 로그인 카드 */}
                <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
                    <h2 className="text-xl font-semibold text-white mb-6 text-center">
                        로그인
                    </h2>

                    <div className="space-y-4">
                        {/* 카카오 로그인 */}
                        <button
                            onClick={handleKakaoLogin}
                            disabled={isLoggingIn}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#FEE500] hover:bg-[#FDD800] text-[#391B1B] font-medium transition-all duration-200 hover:shadow-lg hover:shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.86 5.18 4.64 6.54-.2.76-.74 2.76-.85 3.18-.14.54.2.53.42.38.17-.12 2.72-1.86 3.82-2.61.64.09 1.29.13 1.97.13 5.52 0 10-3.48 10-7.8S17.52 3 12 3z" />
                            </svg>
                            카카오로 시작하기
                        </button>

                        {/* <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-600"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-800/50 text-gray-400">또는</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={isLoggingIn}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-700 font-medium transition-all duration-200 hover:shadow-lg hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            Google로 시작하기
                        </button> */}
                    </div>

                    {/* 안내 문구 */}
                    <p className="mt-8 text-center text-sm text-gray-500">
                        로그인하면{' '}
                        <span className="text-gray-400">서비스 이용약관</span> 및{' '}
                        <span className="text-gray-400">개인정보 처리방침</span>에
                        동의하게 됩니다.
                    </p>
                </div>
            </div>
        </div>
    )
}
