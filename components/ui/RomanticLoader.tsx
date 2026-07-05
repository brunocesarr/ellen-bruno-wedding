'use client'

import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

type Props = {
  message?: string
  submessage?: string

  variant?: 'fullscreen' | 'inline'
}

export function RomanticLoader({
  message = 'Um momento...',
  submessage,
  variant = 'fullscreen',
}: Props) {
  const reduce = useReducedMotion()

  const HeartIcon = (
    <motion.div
      animate={
        reduce
          ? {}
          : {
              scale: [1, 1.15, 1],
              rotate: [0, -5, 5, 0],
            }
      }
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      className="relative"
    >
      <Heart
        className="h-12 w-12 fill-amber-700 text-amber-700 drop-shadow-[0_4px_12px_rgba(168,118,62,0.35)]"
        strokeWidth={1.5}
      />

      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full bg-amber-400/30 blur-xl"
          animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  )

  const Petals =
    variant === 'fullscreen' && !reduce ? (
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-full bg-amber-300/40"
            initial={{
              x: `${10 + i * 11}%`,
              y: '110%',
              opacity: 0,
            }}
            animate={{
              y: '-10%',
              x: [
                `${10 + i * 11}%`,
                `${15 + i * 11}%`,
                `${5 + i * 11}%`,
                `${10 + i * 11}%`,
              ],
              opacity: [0, 0.7, 0.7, 0],
            }}
            transition={{
              duration: 6 + (i % 3),
              repeat: Infinity,
              delay: i * 0.7,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    ) : null

  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center gap-3 py-6">
        {HeartIcon}
        {message && (
          <p className="font-serif text-sm italic text-stone-600">{message}</p>
        )}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
      className="
       fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5
       bg-gradient-to-br from-[#faf6ef] via-[#f5efe4] to-[#ede2cd]
       backdrop-blur-sm
     "
    >
      {Petals}

      <div className="relative z-10 flex flex-col items-center gap-5">
        {HeartIcon}

        <div className="flex flex-col items-center gap-1 text-center">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="font-serif text-xl italic text-amber-800"
          >
            {message}
          </motion.p>
          {submessage && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-sm text-stone-500"
            >
              {submessage}
            </motion.p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-amber-700"
              animate={reduce ? {} : { opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </div>

      <span className="sr-only">Carregando, por favor aguarde</span>
    </motion.div>
  )
}
