'use client'

import { FloralFrame } from '@/components/layout/FloralFrame'
import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { Divider } from '@/components/ui/Divider'
import { WEDDING_DETAILS } from '@/lib/constants'
import { motion, type Variants } from 'motion/react'

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function InvitationSection() {
  const { displayDate } = WEDDING_DETAILS

  return (
    <SectionWrapper id="invitation" variant="cream">
      <FloralFrame
        src="/images/wreath-top.png"
        position="top"
        className="opacity-70"
      />
      <motion.div
        className="text-center"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <Divider variant="sage" />

        <motion.h2
          variants={itemVariants}
          className="mb-6 font-display text-2xl font-semibold text-charcoal"
        >
          Queridos amigos e família!
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="mx-auto max-w-sm font-body text-sm leading-[1.8] text-warm-gray"
        >
          Com grande alegria, convidamos vocês para celebrar conosco o dia mais
          importante de nossas vidas — o nosso casamento!
        </motion.p>

        <motion.div variants={itemVariants} className="mt-12">
          <p className="font-display text-3xl font-light tracking-wide text-terracotta">
            {displayDate}
          </p>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="mt-10 font-body text-sm leading-relaxed text-warm-gray"
        >
          Será uma honra ter vocês ao nosso lado
          <br />
          neste momento tão especial.
        </motion.p>

        <Divider variant="sage" />
      </motion.div>
    </SectionWrapper>
  )
}
