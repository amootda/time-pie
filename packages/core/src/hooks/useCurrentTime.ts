import { useState, useEffect } from 'react'

/**
 * 현재 시간을 반환하고, 1분마다 업데이트
 */
export function useCurrentTime(updateInterval = 60000): Date {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, updateInterval)

    return () => clearInterval(timer)
  }, [updateInterval])

  return currentTime
}
