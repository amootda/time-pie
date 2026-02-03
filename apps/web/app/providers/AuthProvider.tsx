'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  signInWithKakao,
  signInWithGoogle,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  type AuthUser
} from '@time-pie/supabase'

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

  useEffect(() => {
    // Get initial user
    const initAuth = async () => {
      try {
        const user = await getCurrentUser()
        setUser(user)
      } catch (error) {
        console.error('Failed to get current user:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    try {
      const { data: { subscription } } = onAuthStateChange((user) => {
        setUser(user)
        setLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error('Failed to set up auth listener:', error)
      setLoading(false)
    }
  }, [])

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
