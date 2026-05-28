'use client'

import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { Button } from '@/components/ui/Button'
import { WEDDING_DETAILS } from '@/src/lib/constants'
import { motion, type Variants } from 'motion/react'

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

type Props = {
  token?: string
}

export function RsvpSection({ token }: Props) {
  const { displayDate, time } = WEDDING_DETAILS

  return (
    <SectionWrapper id="rsvp" variant="cream" className="pb-28">
      <div className="text-center">
        {/* Date & Time */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-display text-3xl font-light tracking-wide text-terracotta"
        >
          {displayDate}
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-2 font-display text-2xl font-light text-terracotta-muted"
        >
          {time}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mx-auto mt-8 max-w-xs font-body text-sm leading-[1.8] text-warm-gray"
        >
          Ficaremos muito felizes com a sua presença!
          <br />
          Por favor, confirme abaixo.
        </motion.p>

        <motion.a
          variants={formItemVariants}
          href={`/rsvp?token=${token}`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block"
        >
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="min-w-fit min-h-4 mt-6 hover:cursor-pointer"
          >
            Confirmar Presença
          </Button>
        </motion.a>
      </div>
    </SectionWrapper>
  )
}
