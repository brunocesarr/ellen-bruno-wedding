'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

/**
 * Returns `true` for ~250ms after the URL changes, useful for
 * showing a brief loading state on tab/route transitions.
 */
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
