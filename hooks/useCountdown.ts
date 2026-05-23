'use client'

import { useHydrated } from '@/hooks/useHydrated'
import { useEffect, useState } from 'react'

interface CountdownTime {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface UseCountdownReturn {
  timeLeft: CountdownTime
  isExpired: boolean
  isMounted: boolean
}

export function useCountdown(targetDate: string): UseCountdownReturn {
  const isMounted = useHydrated()
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    if (!isMounted) return

    let rafId: number | null = null
    let intervalId: ReturnType<typeof setInterval> | null = null

    const update = () => {
      const target = new Date(targetDate).getTime()
      const now = Date.now()
      const difference = target - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        if (intervalId) clearInterval(intervalId)
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }

    rafId = requestAnimationFrame(() => {
      update()
      intervalId = setInterval(update, 1000)
    })

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [isMounted, targetDate])

  return { timeLeft, isExpired, isMounted }
}
