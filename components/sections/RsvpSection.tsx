'use client'

import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { Button } from '@/components/ui/Button'
import { WEDDING_DETAILS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useCallback, useState, type FormEvent } from 'react'

const formVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const formItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export function RsvpSection() {
  const { displayDate, time, couple } = WEDDING_DETAILS
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')
  const [guestName, setGuestName] = useState('')

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      if (!guestName.trim()) return

      setStatus('loading')
      try {
        const response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: guestName,
            attending: true,
            timestamp: new Date().toISOString(),
          }),
        })
        setStatus(response.ok ? 'success' : 'error')
      } catch {
        setStatus('error')
      }
    },
    [guestName]
  )

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

        {/* Form / Success */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="space-y-3"
              >
                <p className="font-display text-xl text-terracotta">
                  Obrigado, {guestName}! ✿
                </p>
                <p className="font-body text-sm text-warm-gray">
                  Estamos ansiosos para celebrar com você
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="mx-auto max-w-xs space-y-4"
                variants={formVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={formItemVariants}>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className={cn(
                      'w-full rounded-button border border-blush bg-ivory px-6 py-3.5',
                      'font-body text-sm text-charcoal placeholder:text-warm-gray/50',
                      'transition-all duration-200',
                      'focus:border-terracotta focus:ring-2 focus:ring-terracotta/10 focus:outline-none'
                    )}
                  />
                </motion.div>

                <motion.div variants={formItemVariants}>
                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    {status === 'loading'
                      ? 'Enviando...'
                      : 'Confirmar Presença'}
                  </Button>
                </motion.div>

                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-body text-xs text-red-500"
                  >
                    Erro ao enviar. Tente novamente.
                  </motion.p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  )
}
