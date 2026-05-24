'use client'

import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export function RouteLoader() {
  const pathname = usePathname()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(t)
  }, [pathname])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ transformOrigin: '0% 50%' }}
          className="fixed inset-x-0 top-0 z-[100] h-0.5 bg-linear-to-r from-terracotta via-terracotta-light to-sage"
        />
      )}
    </AnimatePresence>
  )
}
