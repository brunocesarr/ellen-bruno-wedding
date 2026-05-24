'use client'
import { useNavigationLoading } from '@/hooks/useNavigationLoading'
import { AnimatePresence, motion } from 'motion/react'

export function NavigationProgressBar() {
  const loading = useNavigationLoading(400)
  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="nav-bar"
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed left-0 right-0 top-0 z-50 h-0.5 origin-left bg-gradient-to-r from-amber-600 via-amber-700 to-amber-500 shadow-[0_0_8px_rgba(168,118,62,0.5)]"
        />
      )}
    </AnimatePresence>
  )
}
