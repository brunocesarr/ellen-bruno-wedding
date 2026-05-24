'use client'

import { Reveal } from '@/components/ui/Reveal'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'

const PHOTOS = [
  { src: '/images/about/about-1.jpg', alt: 'Ellen e Bruno se conhecendo' },
  { src: '/images/about/about-2.jpg', alt: 'Pedido de namoro' },
  { src: '/images/about/about-3.jpg', alt: 'Pedido de casamento' },
]

export function AboutSection() {
  const reduce = useReducedMotion()

  return (
    <section
      id="sobre-nos"
      className="relative overflow-hidden bg-[#faf6ef] py-20 md:py-28"
      aria-labelledby="about-title"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Header — title left, paragraph right */}
        <div className="grid gap-10 md:grid-cols-2 md:items-end md:gap-16">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.4em] text-amber-700/80">
              Nossa história
            </p>
            <h2
              id="about-title"
              className="mt-3 font-serif text-4xl tracking-tight text-amber-900 md:text-6xl"
            >
              Sobre <span className="italic">nós</span>
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <p className="font-serif text-base italic leading-relaxed text-stone-700 md:text-lg">
              Tudo começou com um simples olhar e se transformou em parceria,
              cumplicidade e o amor que celebramos hoje. Cada momento — dos
              pequenos cafés da manhã às grandes viagens — construiu o casal que
              somos. E agora, queremos dividir esse capítulo tão especial com
              vocês.
            </p>
            <a
              href="#timeline"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
            >
              Ler mais
            </a>
          </Reveal>
        </div>

        {/* Photo grid — staggered vertical photos */}
        <div className="mt-16 grid grid-cols-3 gap-3 md:mt-24 md:gap-6">
          {PHOTOS.map((photo, i) => (
            <motion.div
              key={photo.src}
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.7,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`
              relative aspect-[3/4] overflow-hidden rounded-2xl shadow-md
              ${i === 0 ? 'translate-y-0' : ''}
              ${i === 1 ? 'translate-y-8 md:translate-y-16' : ''}
              ${i === 2 ? 'translate-y-2 md:translate-y-4' : ''}
            `}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 33vw, 30vw"
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative blurred shapes */}
      <div className="pointer-events-none absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-rose-200/30 blur-3xl" />
    </section>
  )
}
