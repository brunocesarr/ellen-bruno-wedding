'use client'

import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { Divider } from '@/components/ui/Divider'
import { WEDDING_DETAILS } from '@/lib/constants'
import { motion, type Variants } from 'motion/react'

const swatchContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const swatchVariants: Variants = {
  hidden: { opacity: 0, scale: 0, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
}

export function DressCodeSection() {
  const { dressCode } = WEDDING_DETAILS

  return (
    <SectionWrapper id="dress-code" variant="ivory">
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-2 font-display text-section-title font-bold uppercase tracking-[0.2em] text-terracotta"
        >
          Dress Code
        </motion.h2>

        <p className="mb-3 font-body text-xs uppercase tracking-widest text-warm-gray">
          Paleta de cores
        </p>

        <p className="mx-auto mb-10 max-w-xs font-display text-base italic text-warm-gray">
          Terracotta & Azul
        </p>

        {/* Animated Color Swatches */}
        <motion.div
          className="flex flex-wrap items-start justify-center gap-5"
          variants={swatchContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {dressCode.map((color) => (
            <motion.div
              key={color.hex}
              variants={swatchVariants}
              className="flex flex-col items-center gap-2"
              whileHover={{ scale: 1.15, y: -4 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <div
                className="h-14 w-14 rounded-full shadow-sm ring-1 ring-charcoal/5"
                style={{ backgroundColor: color.hex }}
              />
              <span className="font-body text-[0.65rem] tracking-wide text-warm-gray">
                {color.name}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <Divider variant="light" className="mt-10" />

        <p className="mx-auto max-w-xs font-body text-sm leading-[1.8] text-warm-gray">
          Pedimos gentilmente que escolham trajes nas cores acima para
          harmonizar com a decoração do nosso dia especial.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-px w-8 bg-terracotta/20" />
          <span className="font-display text-xs tracking-wider text-terracotta/60">
            TRAJE ESPORTE FINO
          </span>
          <div className="h-px w-8 bg-terracotta/20" />
        </div>
      </div>
    </SectionWrapper>
  )
}
