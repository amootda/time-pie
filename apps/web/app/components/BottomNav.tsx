'use client'

import { CalendarDays, ListTodo, PieChart, Settings, Trophy } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { memo } from 'react'

const navItems = [
  { href: '/', label: 'Home', icon: PieChart },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/todos', label: 'Todos', icon: ListTodo },
  { href: '/habits', label: 'Habits', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export const BottomNav = memo(function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border safe-area-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 group ${isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
                }`}
            >
              {/* Active Indicator Background */}
              {isActive && (
                <span className="absolute top-1 w-10 h-8 bg-primary/10 rounded-2xl -z-10 animate-fade-in" />
              )}

              <Icon
                className={`w-6 h-6 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.5px]' : 'group-hover:scale-105'}`}
              />
              <span className={`text-[10px] mt-1 font-medium transition-colors ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
})
