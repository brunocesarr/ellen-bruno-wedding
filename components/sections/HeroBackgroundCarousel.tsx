'use client'

import { SmartImage } from '@/components/ui/SmartImage'
import type { ResolvedSiteImage } from '@/src/lib/get-site-image'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'

export type HeroSlide = ResolvedSiteImage & { key?: string }

const SLIDE_DURATION_MS = 5000
const TRANSITION_SECONDS = 0.95
/** Hold slide 2 back so it never competes with the LCP image. */
const PREFETCH_DELAY_MS = 1200

export function HeroBackgroundCarousel({
  slides,
}: {
  slides: readonly HeroSlide[]
}) {
  const reduce = useReducedMotion()
  const total = slides.length
  const isStatic = Boolean(reduce) || total < 2

  const [index, setIndex] = useState(0)
  const [snapping, setSnapping] = useState(false)
  const [ready, setReady] = useState(1)

  useEffect(() => {
    if (isStatic) return

    const id = window.setInterval(() => {
      if (document.hidden) return
      setIndex((prev) => Math.min(prev + 1, total))
    }, SLIDE_DURATION_MS)

    return () => window.clearInterval(id)
  }, [isStatic, total])

  // Mount images just ahead of the playhead, so a slide never arrives
  // half-decoded. Once mounted they stay mounted, so later laps are free.
  useEffect(() => {
    if (isStatic) return

    const id = window.setTimeout(
      () => setReady((prev) => Math.max(prev, Math.min(index + 2, total))),
      index === 0 ? PREFETCH_DELAY_MS : 0
    )

    return () => window.clearTimeout(id)
  }, [index, isStatic, total])

  // Release the no-transition flag one frame after the silent jump home.
  useEffect(() => {
    if (!snapping) return

    const id = requestAnimationFrame(() => setSnapping(false))
    return () => cancelAnimationFrame(id)
  }, [snapping])

  if (isStatic) {
    const first = slides[0]

    if (first == null) {
      return null
    }

    return (
      <div aria-hidden className="absolute inset-0 overflow-hidden bg-charcoal">
        <SmartImage
          src={first.src}
          fallback={first.fallback}
          alt=""
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={80}
        />
      </div>
    )
  }

  // A clone of slide 1 sits at the end. We animate onto it, then jump back
  // to the real slide 1 with transitions off — so the loop has no rewind.
  const positions = slides[0] ? [...slides, slides[0]] : [...slides]

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-charcoal">
      <motion.div
        className="absolute inset-0 flex"
        style={{ willChange: 'transform' }}
        animate={{ x: `-${index * 100}%` }}
        transition={
          snapping
            ? { duration: 0 }
            : { duration: TRANSITION_SECONDS, ease: [0.22, 0.61, 0.36, 1] }
        }
        onAnimationComplete={() => {
          if (index === total) {
            setSnapping(true)
            setIndex(0)
          }
        }}
      >
        {positions.map((slide, position) => {
          const isClone = position === total
          const shouldRender = isClone || position < ready

          return (
            <div
              key={
                isClone ? 'clone' : (slide.key ?? slide.fallback ?? position)
              }
              className="relative h-full w-full shrink-0"
            >
              {shouldRender ? (
                <SmartImage
                  src={slide.src}
                  fallback={slide.fallback}
                  alt=""
                  fill
                  priority={position === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                />
              ) : null}
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
