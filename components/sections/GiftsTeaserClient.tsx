'use client'

import { SmartImage } from '@/components/ui/SmartImage'
import { ResolvedSiteImageWithKey } from '@/src/lib/get-site-image'
import { motion, useReducedMotion } from 'motion/react'

export type Polaroid = {
  key: string
  label?: string
} & ResolvedSiteImageWithKey

export function GiftsTeaserClient({ polaroids }: { polaroids: Polaroid[] }) {
  const reduce = useReducedMotion()
  const transforms = [
    'rotate-[-8deg] translate-x-0 translate-y-0',
    'rotate-[5deg] translate-x-12 translate-y-6 md:translate-x-20',
    'rotate-[-3deg] translate-x-24 translate-y-12 md:translate-x-40 md:translate-y-16',
  ]

  return (
    <>
      <div className="relative mx-auto h-[340px] w-full max-w-md md:h-[420px]">
        {polaroids.map((p, i) => (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, y: reduce ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.15 }}
            className={`absolute left-0 top-0 h-56 w-44 bg-white p-3 pb-10 shadow-xl md:h-72 md:w-56 ${transforms[i]}`}
            style={{ zIndex: i + 1 }}
          >
            <div className="relative h-full w-full overflow-hidden bg-amber-50">
              <SmartImage
                src={p.src}
                fallback={p.fallback}
                alt={p.alt || `E&B ${p.label}`}
                fill
                sizes="(max-width: 768px) 176px, 224px"
                className="object-cover"
              />
            </div>
            <p className="absolute bottom-2 left-0 right-0 text-center font-serif text-sm italic text-stone-600">
              {p.label}
            </p>
          </motion.div>
        ))}
      </div>
    </>
  )
}
