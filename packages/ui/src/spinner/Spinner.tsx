'use client'

import { motion } from 'framer-motion'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
  fullScreen?: boolean
}

const sizeMap = {
  sm: 20,
  md: 32,
  lg: 48,
}

const borderMap = {
  sm: 2,
  md: 3,
  lg: 4,
}

export function Spinner({ size = 'md', label, fullScreen = false }: SpinnerProps) {
  const px = sizeMap[size]
  const border = borderMap[size]

  const spinner = (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        style={{
          width: px,
          height: px,
          border: `${border}px solid rgba(156, 163, 175, 0.3)`,
          borderTop: `${border}px solid #FF6B35`,
          borderRadius: '50%',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {label && (
        <span className={`text-gray-500 dark:text-gray-400 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {label}
        </span>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}
