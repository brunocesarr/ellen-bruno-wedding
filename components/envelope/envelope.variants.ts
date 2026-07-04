import type { Variants } from 'motion/react'

export const flapVariants: Variants = {
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

export const letterContentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.7 },
  },
}

export const letterItemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export const ctaVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: 1.4, ease: 'easeOut' },
  },
}
