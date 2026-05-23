'use client'

import { WEDDING_DETAILS } from '@/lib/constants'
import { motion, useScroll, useTransform } from 'motion/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export function HeroSection() {
  const { couple, displayDate } = WEDDING_DETAILS
  const ref = useRef<HTMLElement | null>(null)

  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsHydrated(true))
    return () => cancelAnimationFrame(id)
  }, [])

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
      style={{ position: 'relative' }} // ← FIX: explicit position
    >
      {/* Parallax Background */}
      <motion.div
        className="absolute inset-0 z-0"
        style={isHydrated ? { y: backgroundY } : { y: '0%' }}
      >
        <Image
          src="/images/hero-bg.jpg"
          alt="Elegant wedding venue with warm lighting"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/25 via-charcoal/5 to-charcoal/35" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-20 flex flex-col items-center px-6 text-center text-ivory"
        style={isHydrated ? { y: textY, opacity } : { y: '0%', opacity: 1 }}
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
