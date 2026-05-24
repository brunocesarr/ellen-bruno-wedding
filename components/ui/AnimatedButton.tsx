'use client'

import { Check, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

type Props = {
  pending?: boolean
  success?: boolean
  children: React.ReactNode
  pendingLabel?: string
  successLabel?: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

export function AnimatedButton({
  pending,
  success,
  children,
  pendingLabel = 'Enviando…',
  successLabel = 'Pronto!',
  className = '',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={pending || success || rest.disabled}
      className={`btn-primary relative overflow-hidden ${className}`}
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2"
          >
            <Check className="size-4" /> {successLabel}
          </motion.span>
        ) : pending ? (
          <motion.span
            key="pending"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2"
          >
            <Loader2 className="size-4 animate-spin" /> {pendingLabel}
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
