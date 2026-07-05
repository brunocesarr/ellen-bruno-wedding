'use client'

import { AnimatePresence, motion } from 'motion/react'
import { flapVariants } from './envelope.variants'

export function EnvelopeGraphic({
  isClosed,
  isOpening,
  isOpen,
  onOpen,
}: {
  isClosed: boolean
  isOpening: boolean
  isOpen: boolean
  onOpen: () => void
}) {
  return (
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
      onClick={onOpen}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && isClosed) {
          e.preventDefault()
          onOpen()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={isClosed ? 'Clique para abrir o convite' : 'Convite aberto'}
    >
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
            background: 'linear-gradient(135deg, #B07040 0%, #C08050 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            clipPath: 'polygon(100% 0, 48% 55%, 100% 100%)',
            background: 'linear-gradient(225deg, #B07040 0%, #C08050 100%)',
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
            background: 'linear-gradient(180deg, #A86838 0%, #905528 100%)',
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
  )
}
