'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useState } from 'react'
import { EnvelopeGraphic } from './EnvelopeGraphic'
import { Letter } from './Letter'
import { ctaVariants } from './envelope.variants'

type State = 'closed' | 'opening' | 'open'

export function Envelope({ token }: { token: string }) {
  const [state, setState] = useState<State>('closed')
  const shouldReduceMotion = useReducedMotion()

  const handleOpen = useCallback(() => {
    if (state !== 'closed') return
    setState('opening')
    setTimeout(() => setState('open'), shouldReduceMotion ? 0 : 650)
  }, [state, shouldReduceMotion])

  const isClosed = state === 'closed'
  const isOpening = state === 'opening' || state === 'open'
  const isOpen = state === 'open'

  return (
    <div
      style={{
        height:
          'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
        display: 'grid',
        placeItems: 'center',
        minHeight: '100dvh',
        padding: 'clamp(1rem, 4vw, 2rem)',
        backgroundColor: 'var(--color-cream, #F8F4EE)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'clamp(0.75rem, 2vw, 1.25rem)',
          width: '100%',
          maxWidth: '480px',
        }}
      >
        {/* Header */}
        <motion.p
          className="font-body"
          animate={{ opacity: isClosed ? 1 : 0.3 }}
          transition={{ duration: 0.4 }}
          style={{
            fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(138,126,118,0.6)',
          }}
        >
          Você recebeu um convite
        </motion.p>

        {/* ===== ENVELOPE + LETTER ===== */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            /* Taller ratio to fit accessible text */
            aspectRatio: '4 / 3',
          }}
        >
          <Letter isOpen={isOpen} shouldReduceMotion={shouldReduceMotion} />
          <EnvelopeGraphic
            isClosed={isClosed}
            isOpening={isOpening}
            isOpen={isOpen}
            onOpen={handleOpen}
          />
        </div>

        {/* Hint */}
        <AnimatePresence>
          {isClosed && (
            <motion.p
              key="hint"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1, y: [0, -4, 0] }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{
                y: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' },
              }}
              className="font-body"
              style={{
                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(138,126,118,0.5)',
              }}
            >
              Toque para abrir
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA */}
        <AnimatePresence>
          {isOpen && (
            <motion.a
              key="cta"
              href={`/invite/full?token=${token}`}
              variants={ctaVariants}
              initial="hidden"
              animate="visible"
              className="font-body"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: 'clamp(44px, 8vw, 52px)',
                padding: '0 clamp(20px, 4vw, 28px)',
                borderRadius: 999,
                backgroundColor: 'var(--color-terracotta, #C17B5A)',
                color: 'white',
                fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(193,123,90,0.3)',
              }}
            >
              Ver convite completo
              <svg
                width={16}
                height={16}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </motion.a>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p
          className="font-body"
          style={{
            fontSize: 'clamp(0.55rem, 1.4vw, 0.65rem)',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(138,126,118,0.25)',
            marginTop: '0.5rem',
          }}
        >
          Wedding Day 2026
        </p>
      </div>
    </div>
  )
}
