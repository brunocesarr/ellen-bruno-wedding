'use client'

import { useHydrated } from '@/hooks/useHydrated'
import { motion } from 'motion/react'

export function MotionWrapper({ children }: { children: React.ReactNode }) {
  const isHydrated = useHydrated()

  return (
    <motion.main
      initial={isHydrated ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative mx-auto h-screen-safe w-full overflow-y-auto md:w-5xl shadow-2xl shadow-charcoal/5"
    >
      {children}
    </motion.main>
  )
}
