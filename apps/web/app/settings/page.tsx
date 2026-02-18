'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header, BottomNav, LoginButton } from '../components'
import { useAuth, useTheme } from '../providers'
import { getUserSettings, upsertUserSettings } from '@time-pie/supabase'

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    events: true,
    todos: true,
    habits: true,
  })
  const [saving, setSaving] = useState(false)

  // Load user settings from Supabase
  useEffect(() => {
    if (!user?.id) return

    const loadSettings = async () => {
      try {
        const settings = await getUserSettings(user.id)
        if (settings) {
          setNotifications({
            events: settings.notifications_events,
            todos: settings.notifications_todos,
            habits: settings.notifications_habits,
          })
          setTheme(settings.theme)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    loadSettings()
  }, [user?.id, setTheme])

  // Save notification setting to Supabase
  const handleNotificationChange = async (key: 'events' | 'todos' | 'habits') => {
    const newValue = !notifications[key]
    setNotifications((prev) => ({ ...prev, [key]: newValue }))

    if (!user?.id) return

    try {
      setSaving(true)
      await upsertUserSettings(user.id, {
        [`notifications_${key}`]: newValue,
      })
    } catch (error) {
      console.error('Failed to save notification setting:', error)
      // Revert on error
      setNotifications((prev) => ({ ...prev, [key]: !newValue }))
    } finally {
      setSaving(false)
    }
  }

  // Save theme setting to Supabase
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)

    if (!user?.id) return

    try {
      setSaving(true)
      await upsertUserSettings(user.id, { theme: newTheme })
    } catch (error) {
      console.error('Failed to save theme setting:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="설정" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Profile Section */}
        <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">👤</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg text-foreground">
                    {user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full mt-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:opacity-80 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg text-foreground">게스트 사용자</p>
                  <p className="text-sm text-muted-foreground">로그인하여 데이터를 동기화하세요</p>
                </div>
              </div>
              <LoginButton />
            </>
          )}
        </div>

        {/* Notifications Section */}
        <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
            <span>🔔</span> 알림 설정
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">일정 알림</p>
                <p className="text-sm text-muted-foreground">일정 시작 전 알림</p>
              </div>
              <button
                onClick={() => handleNotificationChange('events')}
                disabled={!user}
                className={`w-12 h-7 rounded-full transition-colors relative ${notifications.events ? 'bg-primary' : 'bg-muted'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-card rounded-full shadow transition-transform ${notifications.events ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">할 일 알림</p>
                <p className="text-sm text-muted-foreground">마감일 알림</p>
              </div>
              <button
                onClick={() => handleNotificationChange('todos')}
                disabled={!user}
                className={`w-12 h-7 rounded-full transition-colors relative ${notifications.todos ? 'bg-primary' : 'bg-muted'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-card rounded-full shadow transition-transform ${notifications.todos ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">습관 리마인더</p>
                <p className="text-sm text-muted-foreground">습관 완료 리마인더</p>
              </div>
              <button
                onClick={() => handleNotificationChange('habits')}
                disabled={!user}
                className={`w-12 h-7 rounded-full transition-colors relative ${notifications.habits ? 'bg-primary' : 'bg-muted'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-card rounded-full shadow transition-transform ${notifications.habits ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
              </button>
            </div>
          </div>
          {!user && (
            <p className="text-xs text-muted-foreground mt-3">로그인하면 설정이 저장됩니다</p>
          )}
        </div>

        {/* Theme Section */}
        <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
            <span>🎨</span> 테마
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'light', label: '라이트', icon: '☀️' },
              { value: 'dark', label: '다크', icon: '🌙' },
              { value: 'system', label: '시스템', icon: '💻' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value as 'light' | 'dark' | 'system')}
                className={`py-3 rounded-xl text-sm font-medium transition-colors ${theme === option.value
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:opacity-80'
                  }`}
              >
                <span className="block text-lg mb-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Section */}
        <div className="bg-card rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
            <span>💾</span> 데이터
          </h3>
          <div className="space-y-2">
            <button className="w-full py-3 text-left px-4 bg-muted rounded-xl hover:opacity-80 transition-colors flex items-center justify-between text-foreground">
              <span>데이터 내보내기</span>
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <button className="w-full py-3 text-left px-4 bg-muted rounded-xl hover:opacity-80 transition-colors flex items-center justify-between text-foreground">
              <span>데이터 가져오기</span>
              <svg className="w-5 h-5 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <button className="w-full py-3 text-left px-4 bg-error/10 text-error rounded-xl hover:bg-error/20 transition-colors flex items-center justify-between">
              <span>모든 데이터 삭제</span>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-card rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
            <span>ℹ️</span> 정보
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">버전</span>
              <span className="font-medium text-foreground">1.0.0 (MVP)</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <a href="#" className="block text-secondary hover:underline">이용약관</a>
            <a href="#" className="block text-secondary hover:underline">개인정보처리방침</a>
            <a href="#" className="block text-secondary hover:underline">피드백 보내기</a>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
