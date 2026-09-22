'use client'

import { RomanticLoader } from '@/components/ui/RomanticLoader'
import { AnimatePresence, motion } from 'motion/react'

type Props = {
  show: boolean
  message?: string
}

/**
 * Dims and blocks the whole page while a mutation is in flight.
 *
 * z-[60] on purpose: it must sit ABOVE ConfirmDialog's own z-50 overlay, so
 * confirming an action dims the dialog too instead of leaving it sitting
 * brightly on top of the veil.
 */
export function BusyOverlay({ show, message = 'Salvando...' }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="alert"
          aria-live="assertive"
          aria-busy="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-stone-900/50 backdrop-blur-sm"
        >
          <div className="rounded-2xl bg-white/95 px-10 py-6 shadow-xl">
            <RomanticLoader variant="inline" message={message} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
