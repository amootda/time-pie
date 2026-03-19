'use client'

import { memo } from 'react'

interface AIInsightsSectionProps {
  insights: Array<{ type: string; message: string }>
}

function getInsightStyle(type: string) {
  switch (type) {
    case 'achievement':
      return { icon: '🎉', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' }
    case 'warning':
      return { icon: '⚠️', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-600 dark:text-amber-400' }
    case 'pattern':
      return { icon: '📊', bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' }
    default:
      return { icon: '💡', bg: 'bg-muted', border: 'border-border/50', text: 'text-foreground' }
  }
}

export const AIInsightsSection = memo(function AIInsightsSection({
  insights,
}: AIInsightsSectionProps) {
  if (insights.length === 0) return null

  return (
    <div className="bg-card p-5 rounded-2xl shadow-sm border border-border/50">
      <h3 className="font-bold text-foreground mb-4">AI 인사이트</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const style = getInsightStyle(insight.type)
          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-xl ${style.bg} border ${style.border}`}
            >
              <span className="text-lg shrink-0">{style.icon}</span>
              <p className={`text-sm font-medium ${style.text}`}>{insight.message}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
})
