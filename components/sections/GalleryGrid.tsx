'use client'

import { SmartImage } from '@/components/ui/SmartImage'
import type { ResolvedSiteImageWithKey } from '@/src/lib/get-site-image'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

type Photo = ResolvedSiteImageWithKey

const OFFSETS = [
  'translate-y-0',
  'md:translate-y-12',
  'md:translate-y-4',
  'md:translate-y-16',
  'md:translate-y-2',
  'md:translate-y-10',
  'md:translate-y-8',
]

export function GalleryGrid({ photos }: { photos: Photo[] }) {
  const reduce = useReducedMotion()
  const [openIndex, setOpenIndex] = useState<number | null>()

  return (
    <>
      <div className="mt-14 grid grid-cols-2 gap-3 md:mt-20 md:grid-cols-3 md:gap-6 lg:grid-cols-4 lg:gap-8">
        {photos.map((photo, i) => (
          <motion.button
            key={photo.key}
            type="button"
            onClick={() => setOpenIndex(i)}
            initial={{ opacity: 0, y: reduce ? 0 : 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              duration: 0.6,
              delay: (i % 4) * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className={`group relative aspect-[3/4] overflow-hidden rounded-xl shadow-sm transition-transform duration-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2 ${
              OFFSETS[i % OFFSETS.length]
            }`}
            aria-label={`Abrir foto: ${photo.alt}`}
          >
            <SmartImage
              src={photo.src}
              fallback={photo.fallback}
              alt={photo.alt}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>
        ))}
      </div>

      <Dialog.Root
        open={openIndex != null}
        onOpenChange={(open) => {
          if (!open) setOpenIndex(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm" />

          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12">
            {openIndex && photos[openIndex] && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative aspect-[3/4] max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl"
              >
                <SmartImage
                  src={photos[openIndex].src}
                  fallback={photos[openIndex].fallback}
                  alt={photos[openIndex].alt}
                  fill
                  sizes="(max-width: 768px) 90vw, 60vw"
                  className="object-cover"
                  priority
                />
              </motion.div>
            )}

            <Dialog.Close
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-stone-700 shadow-lg backdrop-blur transition hover:bg-white"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>

            <Dialog.Title className="sr-only">
              Visualização da foto
            </Dialog.Title>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
