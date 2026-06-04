'use client'

import { motion, useReducedMotion } from 'motion/react'

export function MotionWrapper({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()

  return (
    <motion.main
      initial={reduce ? false : { opacity: 0.001 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative min-h-screen w-full overflow-x-hidden shadow-sm"
    >
      {children}
    </motion.main>
  )
}
