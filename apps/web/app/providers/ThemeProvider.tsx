'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const COOKIE_NAME = 'theme'
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1년

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === 'system') return getSystemTheme()
  return theme
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

function setThemeCookie(theme: Theme) {
  document.cookie = `${COOKIE_NAME}=${theme};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`
}

interface ThemeProviderProps {
  children: React.ReactNode
  initialTheme?: Theme
}

export function ThemeProvider({ children, initialTheme = 'system' }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(initialTheme)
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(
    resolveTheme(initialTheme)
  )

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    const resolved = resolveTheme(newTheme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
    setThemeCookie(newTheme)
  }, [])

  // 클라이언트 hydration 시 system 테마 감지 및 적용
  useEffect(() => {
    const resolved = resolveTheme(theme)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [theme])

  // system 테마일 때 OS 설정 변경 감지
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light'
      setResolvedTheme(resolved)
      applyTheme(resolved)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
