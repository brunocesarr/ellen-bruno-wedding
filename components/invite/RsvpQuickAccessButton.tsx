'use client'

import { SECTION_IDS } from '@/src/lib/constants'
import { Heart } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

/** Show the shortcut only after the guest has scrolled past most of the hero. */
const HERO_FRACTION = 0.6

/**
 * Floating shortcut to the RSVP section on the full invitation.
 *
 * The invitation renders 15 sections and RsvpSection is the 10th, so on a phone
 * the confirmation CTA is several screens of scrolling away. This pill anchors
 * straight to it. It lives bottom-RIGHT on purpose: MusicToggle owns
 * `bottom-6 left-6 z-50` on every page, so the two never overlap.
 */
export function RsvpQuickAccessButton() {
  const reduce = useReducedMotion()

  const [scrolledPastHero, setScrolledPastHero] = useState(false)
  const [rsvpInView, setRsvpInView] = useState(false)
  const [rsvpPassed, setRsvpPassed] = useState(false)

  useEffect(() => {
    let frame: number | null = null

    const readScroll = () => {
      frame = null
      setScrolledPastHero(window.scrollY > window.innerHeight * HERO_FRACTION)
    }

    const onScroll = () => {
      if (frame !== null) return
      frame = requestAnimationFrame(readScroll)
    }

    readScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })

    return () => {
      if (frame !== null) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  useEffect(() => {
    const target = document.getElementById(SECTION_IDS.rsvp)
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        setRsvpInView(entry.isIntersecting)
        // Once the section has scrolled above the viewport the shortcut would
        // point backwards — keep it hidden through the footer.
        setRsvpPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      // Matches SectionWrapper's own reveal threshold.
      { threshold: 0.15 }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [])

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      if (!reduce) return
      // `html { scroll-behavior: smooth }` is global and the reduced-motion
      // block in globals.css only neutralises animations/transitions, so the
      // instant jump has to be requested explicitly here.
      const target = document.getElementById(SECTION_IDS.rsvp)
      if (!target) return
      event.preventDefault()
      target.scrollIntoView({ behavior: 'auto', block: 'start' })
    },
    [reduce]
  )

  const visible = scrolledPastHero && !rsvpInView && !rsvpPassed

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={`#${SECTION_IDS.rsvp}`}
          onClick={handleClick}
          aria-label="Ir para confirmação de presença"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 1 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileTap={reduce ? undefined : { scale: 0.96 }}
          className="
            fixed bottom-6 right-4 z-40
            mb-[env(safe-area-inset-bottom,0px)]
            inline-flex min-h-11 items-center gap-2
            rounded-full bg-terracotta px-4 py-3
            font-display text-[11px] font-medium uppercase tracking-wider
            text-ivory shadow-soft
            transition-colors duration-300 ease-out
            hover:bg-terracotta-dark
            focus-visible:ring-2 focus-visible:ring-terracotta-light focus-visible:ring-offset-2 focus-visible:outline-none
            md:right-6 md:px-6 md:text-xs
          "
        >
          <Heart className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Confirmar<span className="hidden sm:inline"> Presença</span>
          </span>
        </motion.a>
      )}
    </AnimatePresence>
  )
}
