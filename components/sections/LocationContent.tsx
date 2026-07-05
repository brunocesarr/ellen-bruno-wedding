'use client'

import { SectionWrapper } from '@/components/layout/SectionWrapper'
import { SmartImage } from '@/components/ui/SmartImage'
import { WEDDING_DETAILS } from '@/src/lib/constants'
import type { ResolvedSiteImage } from '@/src/lib/get-site-image'
import { motion } from 'motion/react'

export function LocationContent({ venue }: { venue: ResolvedSiteImage }) {
  const { location } = WEDDING_DETAILS

  return (
    <SectionWrapper id="location" variant="ivory" className="">
      <div className="text-center border-[1px] border-terracotta rounded-lg py-4 shadow-card ">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-2 font-display text-section-title font-bold uppercase tracking-[0.2em] text-terracotta"
        >
          Local
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 font-body text-xs tracking-widest uppercase text-warm-gray"
        >
          Cerimônia & Recepção
        </motion.p>

        <motion.div
          className="mb-4 space-y-2"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <p className="font-display text-xl font-semibold text-charcoal">
            {location.venue}
          </p>
          <p className="font-body text-sm text-warm-gray">{location.address}</p>
          <p className="font-body text-sm text-warm-gray">{location.city}</p>
        </motion.div>

        {location.mapUrl && (
          <motion.a
            href={location.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wider text-dusty-blue-dark transition-colors hover:text-dusty-blue"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Ver no mapa
          </motion.a>
        )}
      </div>

      <motion.div
        className="relative mx-auto mt-12 aspect-[4/3] w-full max-w-md overflow-hidden rounded-t-card shadow-card drop-shadow-lg"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <SmartImage
          src={venue.src}
          fallback={venue.fallback}
          alt={venue.alt || 'Local do evento com decoração elegante'}
          loading="eager"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 448px"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal/20 to-transparent" />
      </motion.div>
    </SectionWrapper>
  )
}
