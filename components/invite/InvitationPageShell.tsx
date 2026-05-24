'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

export function InvitationPageShell({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()

  return (
    <motion.main
      initial={reduce ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto h-screen-safe w-full shadow-2xl shadow-charcoal/5"
    >
      {children}
    </motion.main>
  )
}
