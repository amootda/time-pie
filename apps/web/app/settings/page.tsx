'use client'

import { useState } from 'react'
import { Header, BottomNav } from '../components'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    events: true,
    todos: true,
    habits: true,
  })
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="설정" />

      <main className="max-w-lg mx-auto px-4 py-4">
        {/* Profile Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-lg">게스트 사용자</p>
              <p className="text-sm text-gray-500">로그인하여 데이터를 동기화하세요</p>
            </div>
          </div>
          <button className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-600 transition-colors">
            로그인 / 회원가입
          </button>
        </div>

        {/* Notifications Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>🔔</span> 알림 설정
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">일정 알림</p>
                <p className="text-sm text-gray-500">일정 시작 전 알림</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, events: !notifications.events })}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications.events ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifications.events ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">할 일 알림</p>
                <p className="text-sm text-gray-500">마감일 알림</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, todos: !notifications.todos })}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications.todos ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifications.todos ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">습관 리마인더</p>
                <p className="text-sm text-gray-500">습관 완료 리마인더</p>
              </div>
              <button
                onClick={() => setNotifications({ ...notifications, habits: !notifications.habits })}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications.habits ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    notifications.habits ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
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
                onClick={() => setTheme(option.value as typeof theme)}
                className={`py-3 rounded-xl text-sm font-medium transition-colors ${
                  theme === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="block text-lg mb-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Data Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>💾</span> 데이터
          </h3>
          <div className="space-y-2">
            <button className="w-full py-3 text-left px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-between">
              <span>데이터 내보내기</span>
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <button className="w-full py-3 text-left px-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-between">
              <span>데이터 가져오기</span>
              <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
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
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <span>ℹ️</span> 정보
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">버전</span>
              <span className="font-medium">1.0.0 (MVP)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">개발자</span>
              <span className="font-medium">Time Pie Team</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">빌드</span>
              <span className="font-medium">2024.01</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
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
