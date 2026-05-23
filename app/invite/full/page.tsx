'use client'

import { CountdownSection } from '@/components/sections/CountdownSection'
import { DressCodeSection } from '@/components/sections/DressCodeSection'
import { HeroSection } from '@/components/sections/HeroSection'
import { InvitationSection } from '@/components/sections/InvitationSection'
import { LocationSection } from '@/components/sections/LocationSection'
import { MonogramSection } from '@/components/sections/MonogramSection'
import { RsvpSection } from '@/components/sections/RsvpSection'
import { TimelineSection } from '@/components/sections/TimelineSection'
import { motion } from 'motion/react'

export default function WeddingPage() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mx-auto h-screen-safe w-full md:w-5xl shadow-2xl shadow-charcoal/5"
    >
      <HeroSection />
      <MonogramSection />
      <CountdownSection />
      <InvitationSection />
      <LocationSection />
      <TimelineSection />
      <DressCodeSection />
      <RsvpSection />

      {/* Footer */}
      <footer className="bg-cream px-6 py-8 text-center">
        <p className="font-script text-2xl text-terracotta">E.B</p>
        <p className="mt-2 font-body text-[0.65rem] uppercase tracking-[0.3em] text-warm-gray/50">
          com amor, 2026
        </p>
      </footer>
    </motion.main>
  )
}
