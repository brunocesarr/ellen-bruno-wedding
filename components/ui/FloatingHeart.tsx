'use client'

import { Heart } from 'lucide-react'
import { motion } from 'motion/react'

type FloatingHeartProps = {
  label?: string
}

export function FloatingHeart({
  label = 'Preparando com carinho…',
}: FloatingHeartProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Heart className="size-16 text-terracotta" fill="currentColor" />
      </motion.div>

      <p className="font-display text-xl italic text-terracotta-dark">
        {label}
      </p>
    </div>
  )
}
