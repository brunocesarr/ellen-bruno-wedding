'use client'

import { WEDDING_DETAILS } from '@/src/lib/constants'
import { motion } from 'motion/react'
import { letterContentVariants, letterItemVariants } from './envelope.variants'

export function Letter({
  isOpen,
  shouldReduceMotion,
}: {
  isOpen: boolean
  shouldReduceMotion: boolean | null
}) {
  const { couple, displayDate, time, location } = WEDDING_DETAILS

  return (
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

        <motion.h2
          variants={letterItemVariants}
          className="font-script"
          style={{
            marginTop: 'clamp(8px, 2vw, 14px)',
            fontSize: 'clamp(2rem, 7vw, 3rem)',
            lineHeight: 1.15,
            color: 'var(--color-terracotta, #b97a57)',
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

        <motion.div
          variants={letterItemVariants}
          style={{
            margin: 'clamp(10px, 2.5vw, 16px) 0',
            width: 'clamp(32px, 8vw, 48px)',
            height: 1,
            background: 'rgba(193,123,90,0.2)',
          }}
        />

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
  )
}
