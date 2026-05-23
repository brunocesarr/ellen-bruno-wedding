'use client'

import { useEffect, useState } from 'react'

export function useHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsHydrated(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return isHydrated
}
