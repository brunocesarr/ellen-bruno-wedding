'use client'

import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { FlipCard } from '@/components/ui/FlipCard'
import { useCountdown } from '@/hooks/useCountdown'
import { WEDDING_DETAILS } from '@/lib/constants'
import { motion, type Variants } from 'motion/react'

const cardContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 18 },
  },
}

export function CountdownSection() {
  const { timeLeft, isExpired, isMounted } = useCountdown(WEDDING_DETAILS.date)

  return (
    <SectionWrapper id="countdown" variant="cream" className="py-16 md:py-24">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 font-display text-lg font-medium tracking-wide text-charcoal sm:text-xl md:mb-14 md:text-2xl"
        >
          Contagem regressiva para o grande dia
        </motion.h2>

        {!isMounted ? (
          <div className="flex items-center justify-center gap-2.5 sm:gap-4 md:gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="h-[72px] w-[68px] animate-pulse rounded-radius-flip bg-flip-bg/40 sm:h-[90px] sm:w-[84px] md:h-[110px] md:w-[100px]" />
                <div className="h-3 w-14 animate-pulse rounded bg-warm-gray/15" />
              </div>
            ))}
          </div>
        ) : isExpired ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <p className="font-script text-4xl text-terracotta">
              O grande dia chegou!
            </p>
            <p className="font-body text-sm text-warm-gray">
              ✿ Hoje celebramos o nosso amor ✿
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="flex items-start justify-center gap-2.5 sm:gap-4 md:gap-5"
            variants={cardContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={cardItemVariants}>
              <FlipCard
                value={timeLeft.days}
                label="Dias"
                maxDigits={timeLeft.days >= 100 ? 3 : 2}
              />
            </motion.div>
            <motion.div variants={cardItemVariants}>
              <FlipCard value={timeLeft.hours} label="Horas" />
            </motion.div>
            <motion.div variants={cardItemVariants}>
              <FlipCard value={timeLeft.minutes} label="Minutos" />
            </motion.div>
            <motion.div variants={cardItemVariants}>
              <FlipCard value={timeLeft.seconds} label="Segundos" />
            </motion.div>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  )
}
