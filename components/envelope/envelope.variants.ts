import type { Variants } from 'motion/react'

// The cover swings open on a left-edge hinge — the "book of congratulations"
// flip mechanic (rotateY around transform-origin: left, in a perspective scene).
// `z` keeps the cover a hair in front of the letter while closed so the two
// coplanar faces don't z-fight inside the shared preserve-3d scene.
export const coverVariants: Variants = {
  closed: { rotateY: 0, z: 1 },
  open: { rotateY: -125, z: 1 },
}

export const letterContentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.75 },
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
    transition: { duration: 0.5, delay: 1.5, ease: 'easeOut' },
  },
}
