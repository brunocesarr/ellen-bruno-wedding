'use client'

import { useHydrated } from '@/hooks/useHydrated'
import { cn } from '@/src/lib/utils'
import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'

interface SectionWrapperProps {
  id?: string
  children: ReactNode
  className?: string
  variant?: 'cream' | 'ivory' | 'terracotta' | 'dusty-blue'
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
}

const bgVariants: Record<string, string> = {
  cream: 'bg-cream',
  ivory: 'bg-ivory',
  terracotta: 'bg-terracotta text-ivory',
  'dusty-blue': 'bg-dusty-blue-pale',
}

export function SectionWrapper({
  id,
  children,
  className,
  variant = 'cream',
}: SectionWrapperProps) {
  const isHydrated = useHydrated()
  return (
    <motion.section
      id={id}
      variants={sectionVariants}
      initial={isHydrated ? 'hidden' : false}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      className={cn(
        'relative overflow-hidden px-6 py-20 md:py-28',
        bgVariants[variant],
        className
      )}
    >
      <div className="mx-auto max-w-lg">{children}</div>
    </motion.section>
  )
}
