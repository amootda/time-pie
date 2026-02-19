'use client'

import { getUserSettings, upsertUserSettings } from '@time-pie/supabase'
import {
  Calendar,
  CheckSquare,
  ChevronRight,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BottomNav, Header, LoginButton } from '../components'
import { useAuth, useTheme } from '../providers'

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
  const [notifPermission, setNotifPermission] = useState<string>('default')

  // 브라우저 알림 권한 상태 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotifPermission(Notification.permission)
    }
  }, [])

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

    // 일정 알림 활성화 시 브라우저 권한 요청
    if (key === 'events' && newValue && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission()
        setNotifPermission(result)
        if (result === 'denied') {
          return // 권한 거부 시 토글하지 않음
        }
      } else if (Notification.permission === 'denied') {
        return // 이미 차단된 경우 토글하지 않음
      }
    }

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

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <section className="bg-card rounded-2xl shadow-sm border border-border/50 p-5 overflow-hidden relative">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : user ? (
            <>
              <div className="flex items-center gap-5 relative">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary/20">
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="프로필"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-foreground truncate">
                    {user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full mt-6 py-3 bg-muted/50 hover:bg-muted text-foreground rounded-xl font-medium transition-colors flex items-center justify-center gap-2 group"
              >
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                <span>로그아웃</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-foreground">게스트 사용자</p>
                  <p className="text-sm text-muted-foreground">로그인하여 데이터를 동기화하세요</p>
                </div>
              </div>
              <LoginButton />
            </>
          )}
        </section>

        {/* Notifications Section */}
        <section className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
          <h3 className="font-bold mb-5 flex items-center gap-2 text-foreground text-lg">
            <span>알림 설정</span>
          </h3>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium text-foreground">일정 알림</p>
                </div>
                <p className="text-xs text-muted-foreground ml-7">
                  {notifPermission === 'denied'
                    ? '브라우저 알림이 차단되어 있습니다'
                    : ''}
                </p>
              </div>
              <button
                onClick={() => handleNotificationChange('events')}
                disabled={!user || notifPermission === 'denied'}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary/20 ${notifications.events ? 'bg-primary' : 'bg-muted'
                  } ${!user || notifPermission === 'denied' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifications.events ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium text-foreground">할 일 알림</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationChange('todos')}
                disabled={!user}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary/20 ${notifications.todos ? 'bg-primary' : 'bg-muted'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifications.todos ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  <p className="font-medium text-foreground">습관 리마인더</p>
                </div>
              </div>
              <button
                onClick={() => handleNotificationChange('habits')}
                disabled={!user}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primary/20 ${notifications.habits ? 'bg-primary' : 'bg-muted'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${notifications.habits ? 'translate-x-5' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>
          </div>
          {!user && (
            <p className="text-xs text-muted-foreground mt-4 bg-muted/50 p-3 rounded-lg text-center">
              로그인하면 설정이 클라우드에 저장됩니다
            </p>
          )}
        </section>

        {/* Theme Section */}
        <section className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
          <h3 className="font-bold mb-5 flex items-center gap-2 text-foreground text-lg">
            <span>테마 설정</span>
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'light', label: '라이트', icon: Sun },
              { value: 'dark', label: '다크', icon: Moon },
              { value: 'system', label: '시스템', icon: Monitor },
            ].map((option) => {
              const Icon = option.icon
              const isSelected = theme === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value as 'light' | 'dark' | 'system')}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200 flex flex-col items-center gap-2 ${isSelected
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-105'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? 'animate-bounce-in' : ''}`} />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Data Section */}
        {/* <section className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
          <h3 className="font-bold mb-5 flex items-center gap-2 text-foreground text-lg">
            <span>데이터 관리</span>
          </h3>
          <div className="space-y-3">
            <button className="w-full p-4 bg-muted/30 hover:bg-muted/60 rounded-xl transition-colors flex items-center justify-between group text-foreground">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg text-muted-foreground group-hover:text-foreground transition-colors">
                  <Download className="w-5 h-5" />
                </div>
                <span className="font-medium">데이터 내보내기</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>

            <button className="w-full p-4 bg-muted/30 hover:bg-muted/60 rounded-xl transition-colors flex items-center justify-between group text-foreground">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg text-muted-foreground group-hover:text-foreground transition-colors">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="font-medium">데이터 가져오기</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
            </button>

            <button className="w-full p-4 bg-error/5 hover:bg-error/10 text-error rounded-xl transition-colors flex items-center justify-between group mt-2 border border-error/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg text-error/80 group-hover:text-error transition-colors">
                  <Trash2 className="w-5 h-5" />
                </div>
                <span className="font-medium">모든 데이터 삭제</span>
              </div>
              <ChevronRight className="w-5 h-5 text-error/30 group-hover:text-error/60 transition-colors" />
            </button>
          </div>
        </section> */}

        {/* About Section */}
        <section className="bg-card rounded-2xl shadow-sm border border-border/50 p-5">
          <h3 className="font-bold mb-5 flex items-center gap-2 text-foreground text-lg">
            <span>앱 정보</span>
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">버전</span>
              <span className="font-medium text-foreground bg-muted px-2 py-1 rounded text-xs">v1.0.0 (MVP)</span>
            </div>
            <div className="space-y-3 pt-2">
              <a href="#" className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors group">
                <span>이용약관</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="#" className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors group">
                <span>개인정보처리방침</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              <a href="#" className="flex items-center justify-between text-muted-foreground hover:text-primary transition-colors group">
                <span>피드백 보내기</span>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
