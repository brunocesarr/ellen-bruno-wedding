'use client'

import { WEDDING_DETAILS } from '@/lib/constants'
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'motion/react'
import { useCallback, useState } from 'react'

type State = 'closed' | 'opening' | 'open'

const flapVariants: Variants = {
  closed: { rotateX: 0, zIndex: 30 },
  opening: {
    rotateX: -180,
    zIndex: 5,
    transition: {
      rotateX: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
      zIndex: { delay: 0.3, duration: 0 },
    },
  },
}

const letterContentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.7 },
  },
}

const letterItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const ctaVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 1.4, ease: 'easeOut' },
  },
}

export function Envelope({ token }: { token: string }) {
  const [state, setState] = useState<State>('closed')
  const shouldReduceMotion = useReducedMotion()
  const { couple, displayDate, time, location } = WEDDING_DETAILS

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
          {/* LETTER */}
          <motion.div
            animate={{
              y: isOpen ? '-50%' : '0%',
              zIndex: isOpen ? 50 : 1,
              boxShadow: isOpen
                ? '0 10px 40px rgba(0,0,0,0.1)'
                : '0 1px 3px rgba(0,0,0,0.02)',
            }}
            transition={{
              y: {
                duration: shouldReduceMotion ? 0 : 0.8,
                ease: [0.33, 1, 0.68, 1],
                delay: 0.15,
              },
              zIndex: { duration: 0 },
              boxShadow: { duration: 0.4, delay: 0.3 },
            }}
            style={{
              position: 'absolute',
              left: '5%',
              right: '5%',
              top: '4%',
              bottom: '4%',
              borderRadius: 'clamp(4px, 1vw, 8px)',
              backgroundColor: '#FFFDF8',
              overflow: 'hidden',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
          >
            <motion.div
              variants={letterContentVariants}
              initial="hidden"
              animate={isOpen ? 'visible' : 'hidden'}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: 'clamp(1.25rem, 4vw, 2rem) clamp(1rem, 3vw, 1.5rem)',
                textAlign: 'center',
              }}
            >
              {/* Ornament */}
              <motion.div
                variants={letterItemVariants}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(193,123,90,0.35)',
                }}
              >
                <span
                  style={{
                    width: 'clamp(16px, 4vw, 28px)',
                    height: 1,
                    background: 'currentColor',
                  }}
                />
                <span style={{ fontSize: 'clamp(10px, 2vw, 14px)' }}>✿</span>
                <span
                  style={{
                    width: 'clamp(16px, 4vw, 28px)',
                    height: 1,
                    background: 'currentColor',
                  }}
                />
              </motion.div>

              {/* Label */}
              <motion.p
                variants={letterItemVariants}
                className="font-body"
                style={{
                  marginTop: 'clamp(6px, 1.5vw, 10px)',
                  fontSize: 'clamp(0.6rem, 1.6vw, 0.75rem)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'rgba(138,126,118,0.55)',
                }}
              >
                Convite de Casamento
              </motion.p>

              {/* Names — large and readable */}
              <motion.h2
                variants={letterItemVariants}
                className="font-script"
                style={{
                  marginTop: 'clamp(8px, 2vw, 14px)',
                  fontSize: 'clamp(2rem, 7vw, 3rem)',
                  lineHeight: 1.15,
                  color: 'var(--color-terracotta, #C17B5A)',
                }}
              >
                {couple.bride}
                <span
                  style={{
                    margin: '0 0.15em',
                    fontSize: '0.4em',
                    opacity: 0.6,
                  }}
                >
                  &
                </span>
                {couple.groom}
              </motion.h2>

              {/* Invitation text — minimum 14px */}
              <motion.p
                variants={letterItemVariants}
                className="font-body"
                style={{
                  marginTop: 'clamp(8px, 2vw, 12px)',
                  fontSize: 'clamp(0.8rem, 2.2vw, 0.95rem)',
                  lineHeight: 1.6,
                  color: 'rgba(138,126,118,0.8)',
                  maxWidth: '280px',
                }}
              >
                Convidam você para celebrar o nosso casamento
              </motion.p>

              {/* Divider */}
              <motion.div
                variants={letterItemVariants}
                style={{
                  margin: 'clamp(10px, 2.5vw, 16px) 0',
                  width: 'clamp(32px, 8vw, 48px)',
                  height: 1,
                  background: 'rgba(193,123,90,0.2)',
                }}
              />

              {/* Date — prominent */}
              <motion.p
                variants={letterItemVariants}
                className="font-display"
                style={{
                  fontSize: 'clamp(1rem, 3vw, 1.3rem)',
                  fontWeight: 600,
                  color: 'var(--color-charcoal, #3D3632)',
                  letterSpacing: '0.02em',
                }}
              >
                {displayDate}
              </motion.p>

              {/* Time */}
              <motion.p
                variants={letterItemVariants}
                className="font-display"
                style={{
                  marginTop: 'clamp(2px, 0.5vw, 4px)',
                  fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
                  color: 'rgba(138,126,118,0.75)',
                }}
              >
                às {time}
              </motion.p>

              {/* Venue */}
              <motion.p
                variants={letterItemVariants}
                className="font-display"
                style={{
                  marginTop: 'clamp(8px, 2vw, 14px)',
                  fontSize: 'clamp(0.8rem, 2.2vw, 0.95rem)',
                  fontWeight: 500,
                  color: 'var(--color-charcoal, #3D3632)',
                }}
              >
                {location.venue}
              </motion.p>

              <motion.p
                variants={letterItemVariants}
                className="font-body"
                style={{
                  marginTop: 2,
                  fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                  color: 'rgba(138,126,118,0.65)',
                  lineHeight: 1.5,
                }}
              >
                {location.address}
              </motion.p>

              <motion.p
                variants={letterItemVariants}
                className="font-body"
                style={{
                  fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                  color: 'rgba(138,126,118,0.65)',
                }}
              >
                {location.city}
              </motion.p>

              {/* Bottom */}
              <motion.div
                variants={letterItemVariants}
                style={{
                  marginTop: 'clamp(10px, 2.5vw, 16px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgba(122,138,107,0.5)',
                }}
              >
                <span
                  style={{
                    width: 'clamp(12px, 3vw, 20px)',
                    height: 1,
                    background: 'currentColor',
                  }}
                />
                <span
                  className="font-script"
                  style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)' }}
                >
                  com amor
                </span>
                <span
                  style={{
                    width: 'clamp(12px, 3vw, 20px)',
                    height: 1,
                    background: 'currentColor',
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* ===== ENVELOPE ===== */}
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              borderRadius: 'clamp(6px, 1.5vw, 10px)',
              cursor: isClosed ? 'pointer' : 'default',
            }}
            whileHover={isClosed ? { scale: 1.01 } : undefined}
            whileTap={isClosed ? { scale: 0.98 } : undefined}
            onClick={handleOpen}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && isClosed) {
                e.preventDefault()
                handleOpen()
              }
            }}
            role="button"
            tabIndex={0}
            aria-label={
              isClosed ? 'Clique para abrir o convite' : 'Convite aberto'
            }
          >
            {/* Back */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                background: 'linear-gradient(180deg, #E8D0B4 0%, #D4A882 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: 'polygon(0 0, 50% 50%, 100% 0)',
                background: 'linear-gradient(180deg, #DDBFA0 0%, #C89A72 100%)',
              }}
            />

            {/* Front pocket */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '62%',
                zIndex: 20,
                borderRadius: '0 0 inherit inherit',
                background: 'linear-gradient(180deg, #C08050 0%, #A06838 100%)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  clipPath: 'polygon(0 0, 52% 55%, 0 100%)',
                  background:
                    'linear-gradient(135deg, #B07040 0%, #C08050 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  clipPath: 'polygon(100% 0, 48% 55%, 100% 100%)',
                  background:
                    'linear-gradient(225deg, #B07040 0%, #C08050 100%)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  clipPath: 'polygon(0 100%, 50% 35%, 100% 100%)',
                  background: 'linear-gradient(0deg, #905830 0%, #B07040 100%)',
                }}
              />
            </div>

            {/* Flap */}
            <motion.div
              variants={flapVariants}
              animate={isOpening ? 'opening' : 'closed'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '56%',
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                perspective: 900,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background:
                    'linear-gradient(180deg, #A86838 0%, #905528 100%)',
                  backfaceVisibility: 'hidden',
                  borderRadius: '8px 8px 0 0',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: 'linear-gradient(0deg, #F0DCC8 0%, #E8D0B8 100%)',
                  backfaceVisibility: 'hidden',
                  transform: 'rotateX(180deg)',
                  borderRadius: '8px 8px 0 0',
                }}
              />
            </motion.div>

            {/* Seal */}
            <AnimatePresence>
              {!isOpen && (
                <motion.div
                  key="seal"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={
                    isOpening
                      ? { scale: 0, rotate: 15, opacity: 0 }
                      : { scale: [1, 1.04, 1], opacity: 1 }
                  }
                  transition={
                    isOpening
                      ? { duration: 0.3, ease: 'easeIn' }
                      : {
                          scale: {
                            repeat: Infinity,
                            duration: 2,
                            ease: 'easeInOut',
                          },
                        }
                  }
                  exit={{
                    scale: 0,
                    opacity: 0,
                    transition: { duration: 0.15 },
                  }}
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%',
                    width: 'clamp(44px, 10vw, 56px)',
                    height: 'clamp(44px, 10vw, 56px)',
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle at 40% 35%, #B84545 0%, #7A2828 100%)',
                    boxShadow:
                      '0 3px 12px rgba(90,20,20,0.35), inset 0 1px 3px rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 40,
                  }}
                >
                  <span
                    className="font-script"
                    style={{
                      fontSize: 'clamp(14px, 3vw, 18px)',
                      color: 'rgba(255,255,255,0.9)',
                    }}
                  >
                    E&B
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Shadow */}
            <motion.div
              animate={{
                boxShadow: isOpen
                  ? '0 16px 40px rgba(120,70,30,0.2)'
                  : '0 6px 20px rgba(120,70,30,0.15)',
              }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
                borderRadius: 'inherit',
              }}
            />
          </motion.div>
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
