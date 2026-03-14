'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  signInWithKakao,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  type AuthUser
} from '@time-pie/supabase'
import { PUBLIC_PATHS, SESSION_CHECK_THROTTLE_MS } from '@time-pie/core'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithKakao: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const lastCheckedAt = useRef(0)

  useEffect(() => {
    let aborted = false

    // Get initial user
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!aborted) setUser(currentUser)
      } catch (error) {
        console.error('Failed to get current user:', error)
      } finally {
        if (!aborted) setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    let subscription: { unsubscribe: () => void } | undefined
    try {
      const { data } = onAuthStateChange((authUser) => {
        if (!aborted) {
          setUser(authUser)
          setLoading(false)
        }
      })
      subscription = data.subscription
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
      if (!aborted) setLoading(false)
    }

    // 탭이 다시 보일 때 세션 유효성 검증
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return
      if (PUBLIC_PATHS.includes(pathname)) return

      const now = Date.now()
      if (now - lastCheckedAt.current < SESSION_CHECK_THROTTLE_MS) return
      lastCheckedAt.current = now

      try {
        const currentUser = await getCurrentUser()
        if (aborted) return
        if (!currentUser) {
          setUser(null)
          router.replace('/login')
        }
      } catch {
        // 네트워크 에러 등은 무시 — 세션 만료만 처리
        // getUser()가 명시적으로 null을 반환할 때만 로그아웃
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      aborted = true
      subscription?.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router, pathname])

  const handleSignInWithKakao = async () => {
    try {
      await signInWithKakao()
    } catch (error) {
      console.error('Kakao login failed:', error)
      throw error
    }
  }

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Google login failed:', error)
      throw error
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithKakao: handleSignInWithKakao,
        signInWithGoogle: handleSignInWithGoogle,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
