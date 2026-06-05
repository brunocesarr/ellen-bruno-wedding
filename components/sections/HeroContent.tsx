'use client'

import { SmartImage } from '@/components/ui/SmartImage'
import { WEDDING_DETAILS } from '@/src/lib/constants'
import type { ResolvedSiteImage } from '@/src/lib/get-site-image'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

export function HeroContent({ background }: { background: ResolvedSiteImage }) {
  const { couple, displayDate } = WEDDING_DETAILS
  const ref = useRef<HTMLElement | null>(null)
  const reduce = useReducedMotion()

  const [parallaxOn, setParallaxOn] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    setParallaxOn(mq.matches && !reduce)
    const onChange = () => setParallaxOn(mq.matches && !reduce)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [reduce])

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      id="hero"
      ref={ref}
      className="relative flex h-screen-safe flex-col items-center justify-center overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 z-0"
        style={parallaxOn ? { y: backgroundY } : undefined}
      >
        {/* ✅ bucket URL first, local fallback on error */}
        <SmartImage
          src={background.src}
          fallback={background.fallback}
          alt={background.alt || 'Elegant wedding venue with warm lighting'}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={80}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/25 via-charcoal/5 to-charcoal/35" />
      </motion.div>

      <motion.div
        className="relative z-20 flex flex-col items-center px-6 text-center text-ivory"
        style={parallaxOn ? { y: textY, opacity } : undefined}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-3 font-display text-2xl font-light uppercase tracking-[0.4em] text-ivory/70"
        >
          Wedding Day
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-10 font-display text-xl tracking-widest text-ivory/85"
        >
          {displayDate}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
          className="font-script text-hero leading-[1.1] drop-shadow-md md:text-hero-lg"
        >
          <span className="block">{couple.bride}</span>
          <span className="mx-2 inline-block text-[0.6em] text-terracotta-light">
            .
          </span>
          <span className="block">{couple.groom}</span>
        </motion.h1>
      </motion.div>
    </section>
  )
}
