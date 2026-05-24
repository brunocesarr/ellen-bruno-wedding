'use client'

import { SmartImage } from '@/components/ui/SmartImage'
import type { ResolvedSiteImageWithKey } from '@/src/lib/get-site-image'
import { motion, useReducedMotion } from 'motion/react'

type Photo = ResolvedSiteImageWithKey

export function AboutPhotos({ photos }: { photos: Photo[] }) {
  const reduce = useReducedMotion()

  const offsets = ['translate-y-0', 'md:translate-y-16', 'md:translate-y-4']

  return (
    <div className="mt-16 grid grid-cols-3 gap-3 md:mt-24 md:gap-6">
      {photos.map((photo, i) => (
        <motion.div
          key={photo.key}
          initial={{ opacity: 0, y: reduce ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{
            duration: 0.7,
            delay: i * 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`relative aspect-[3/4] overflow-hidden rounded-2xl shadow-md ${
            offsets[i] ?? ''
          }`}
        >
          <SmartImage
            src={photo.src}
            fallback={photo.fallback}
            alt={photo.alt}
            fill
            sizes="(max-width: 768px) 33vw, 30vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </motion.div>
      ))}
    </div>
  )
}
