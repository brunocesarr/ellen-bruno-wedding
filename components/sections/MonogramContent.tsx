'use client'

import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { SmartImage } from '@/components/ui/SmartImage'
import { WEDDING_DETAILS } from '@/src/lib/constants'
import type { ResolvedSiteImage } from '@/src/lib/get-site-image'
import { motion } from 'motion/react'

export function MonogramContent({ monogram }: { monogram: ResolvedSiteImage }) {
  const { couple } = WEDDING_DETAILS

  return (
    <SectionWrapper id="monogram" variant="ivory" className="py-24 md:py-32">
      <div className="flex flex-col items-center text-center">
        <motion.div
          className="relative h-56 w-56 sm:h-64 sm:w-64 md:h-72 md:w-72 rounded-lg"
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <SmartImage
            src={monogram.src}
            fallback={monogram.fallback}
            alt={monogram.alt || `Monograma ${couple.bride} & ${couple.groom}`}
            loading="eager"
            fill
            className="object-contain rounded-lg drop-shadow-lg"
            sizes="(max-width: 640px) 224px, (max-width: 768px) 256px, 288px"
            priority
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 font-display text-xl font-light tracking-widest text-warm-gray"
        >
          {couple.bride} & {couple.groom}
        </motion.p>
      </div>
    </SectionWrapper>
  )
}
