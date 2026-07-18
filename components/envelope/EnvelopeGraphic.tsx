'use client'

import { WEDDING_DETAILS } from '@/src/lib/constants'
import { motion } from 'motion/react'
import { coverVariants } from './envelope.variants'

export function EnvelopeGraphic({
  isClosed,
  isOpen,
  onOpen,
  shouldReduceMotion,
}: {
  isClosed: boolean
  isOpen: boolean
  onOpen: () => void
  shouldReduceMotion: boolean | null
}) {
  const { couple } = WEDDING_DETAILS

  return (
    <motion.div
      variants={coverVariants}
      animate={isOpen ? 'open' : 'closed'}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.95,
        ease: [0.76, 0, 0.24, 1],
      }}
      whileHover={isClosed ? { scale: 1.015 } : undefined}
      whileTap={isClosed ? { scale: 0.985 } : undefined}
      onClick={onOpen}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isClosed) {
          e.preventDefault()
          onOpen()
        }
      }}
      role="button"
      tabIndex={isClosed ? 0 : -1}
      aria-label={isClosed ? 'Toque para abrir o convite' : 'Convite aberto'}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
        cursor: isClosed ? 'pointer' : 'default',
        pointerEvents: isClosed ? 'auto' : 'none',
        borderRadius: 'clamp(6px, 1.5vw, 12px)',
      }}
    >
      {/* Front face — the closed cover */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          borderRadius: 'inherit',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'clamp(10px, 2.5vw, 16px)',
          padding: 'clamp(1.5rem, 5vw, 2.5rem)',
          textAlign: 'center',
          background:
            'linear-gradient(155deg, #FBF6EE 0%, #F2E5D2 55%, #E7D3BB 100%)',
          boxShadow:
            '0 14px 40px rgba(120,70,30,0.22), inset 0 1px 2px rgba(255,255,255,0.6)',
        }}
      >
        {/* Inner double frame */}
        <span
          style={{
            position: 'absolute',
            inset: 'clamp(9px, 2.4vw, 15px)',
            borderRadius: 'clamp(4px, 1vw, 8px)',
            border: '1px solid rgba(193,123,90,0.35)',
          }}
        />

        <p
          className="font-body"
          style={{
            fontSize: 'clamp(0.6rem, 1.6vw, 0.72rem)',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(138,126,118,0.6)',
          }}
        >
          Convite de Casamento
        </p>

        {/* Floral divider */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(193,123,90,0.4)',
          }}
        >
          <span
            style={{
              width: 'clamp(18px, 5vw, 30px)',
              height: 1,
              background: 'currentColor',
            }}
          />
          <span style={{ fontSize: 'clamp(11px, 2.4vw, 15px)' }}>✿</span>
          <span
            style={{
              width: 'clamp(18px, 5vw, 30px)',
              height: 1,
              background: 'currentColor',
            }}
          />
        </span>

        {/* Monogram */}
        <h2
          className="font-script"
          style={{
            fontSize: 'clamp(2.4rem, 9vw, 3.75rem)',
            lineHeight: 1.05,
            color: 'var(--color-terracotta, #b97a57)',
          }}
        >
          {couple.bride}
          <span
            style={{ margin: '0 0.12em', fontSize: '0.42em', opacity: 0.6 }}
          >
            &
          </span>
          {couple.groom}
        </h2>

        {/* Wax seal / open affordance */}
        <motion.span
          aria-hidden
          animate={
            isClosed && !shouldReduceMotion
              ? { scale: [1, 1.06, 1] }
              : { scale: 1 }
          }
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="font-script"
          style={{
            marginTop: 'clamp(2px, 1vw, 6px)',
            width: 'clamp(44px, 11vw, 56px)',
            height: 'clamp(44px, 11vw, 56px)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'clamp(13px, 3vw, 17px)',
            color: 'rgba(255,255,255,0.92)',
            background:
              'radial-gradient(circle at 40% 35%, #B84545 0%, #7A2828 100%)',
            boxShadow:
              '0 3px 12px rgba(90,20,20,0.35), inset 0 1px 3px rgba(255,255,255,0.18)',
          }}
        >
          {couple.bride[0]}
          &amp;
          {couple.groom[0]}
        </motion.span>
      </div>

      {/* Back face — the inside of the cover, seen mid-flip */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 'inherit',
          background: 'linear-gradient(155deg, #F0E4D2 0%, #E3D0B7 100%)',
          boxShadow: 'inset 0 0 70px rgba(120,70,30,0.28)',
        }}
      />
    </motion.div>
  )
}
