'use client'

import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { WEDDING_DETAILS } from '@/lib/constants'
import { motion, type Variants } from 'motion/react'

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export function TimelineSection() {
  const { timeline } = WEDDING_DETAILS

  return (
    <SectionWrapper id="timeline" variant="cream">
      {/* Header */}
      <motion.div
        className="mb-14 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="mb-2 font-display text-section-title font-bold uppercase tracking-[0.2em] text-terracotta">
          Programação
        </h2>
        <p className="font-body text-xs uppercase tracking-widest text-warm-gray">
          O nosso dia
        </p>
      </motion.div>

      {/* Timeline Items */}
      <motion.div
        className="space-y-10 pl-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {timeline.map((event, index) => (
          <motion.div
            key={event.time}
            variants={itemVariants}
            className="relative flex items-center gap-6"
          >
            {/* Time */}
            <div className="w-20 flex-shrink-0 text-right">
              <p className="font-display text-timeline font-light text-terracotta">
                {event.time}
              </p>
            </div>

            {/* Dot + line */}
            <div className="relative flex flex-col items-center">
              <motion.div
                className="h-3 w-3 rounded-full border-2 border-terracotta bg-ivory"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.1 + 0.3,
                  type: 'spring',
                  stiffness: 300,
                }}
              />
              {index < timeline.length - 1 && (
                <div className="absolute top-3 h-16 w-px bg-terracotta/20" />
              )}
            </div>

            {/* Label */}
            <div className="flex-1">
              <p className="font-body text-sm tracking-wide text-charcoal">
                {event.label}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </SectionWrapper>
  )
}
