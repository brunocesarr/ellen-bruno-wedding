'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export function useNavigationLoading(durationMs = 250) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const firstRender = useRef(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    setLoading(true)
    const timer = setTimeout(() => setLoading(false), durationMs)
    return () => clearTimeout(timer)
  }, [pathname, searchParams, durationMs])

  return loading
}
