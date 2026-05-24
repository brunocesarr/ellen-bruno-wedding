'use client'

import { Reveal } from '@/components/ui/Reveal'
import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'

type Parent = {
  name: string
  photo?: string
}

type Family = {
  side: 'Pais da noiva' | 'Pais do noivo'
  coupleName: string
  parents: [Parent, Parent]
}

const FAMILIES: Family[] = [
  {
    side: 'Pais da noiva',
    coupleName: 'Família Ellen',
    parents: [
      { name: 'Maria Silva', photo: '/images/parents/mae-noiva.jpg' },
      { name: 'João Silva', photo: '/images/parents/pai-noiva.jpg' },
    ],
  },
  {
    side: 'Pais do noivo',
    coupleName: 'Família Bruno',
    parents: [
      { name: 'Ana Cesar', photo: '/images/parents/mae-noivo.jpg' },
      { name: 'Carlos Cesar', photo: '/images/parents/pai-noivo.jpg' },
    ],
  },
]

export function ParentsSection() {
  const reduce = useReducedMotion()

  return (
    <section
      id="nossos-pais"
      className="bg-[#f5efe4] py-20 md:py-28"
      aria-labelledby="parents-title"
    >
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="text-center">
          <p className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.4em] text-amber-700/80">
            <Heart className="h-3 w-3 fill-amber-600 text-amber-600" />
            Família
            <Heart className="h-3 w-3 fill-amber-600 text-amber-600" />
          </p>
          <h2
            id="parents-title"
            className="mt-3 font-serif text-4xl tracking-tight text-amber-900 md:text-5xl"
          >
            Nossos <span className="italic">Pais</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-stone-500 md:text-base">
            Com o amor, a benção e o apoio dos que nos trouxeram até aqui.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-12 md:mt-20 md:grid-cols-2 md:gap-8 lg:gap-16">
          {FAMILIES.map((family, fIdx) => (
            <motion.article
              key={family.side}
              initial={{ opacity: 0, y: reduce ? 0 : 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{
                duration: 0.7,
                delay: fIdx * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="text-center"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                {family.side}
              </p>

              {/* Parent photos */}
              <div className="mt-6 flex items-center justify-center gap-4 md:gap-6">
                {family.parents.map((parent, pIdx) => (
                  <ParentPortrait
                    key={parent.name}
                    parent={parent}
                    index={pIdx}
                  />
                ))}
              </div>

              {/* Names */}
              <div className="mt-5 space-y-1">
                {family.parents.map((p) => (
                  <p
                    key={p.name}
                    className="font-serif text-lg italic text-stone-800 md:text-xl"
                  >
                    {p.name}
                  </p>
                ))}
              </div>

              {/* Decorative divider */}
              <div className="mx-auto mt-6 flex max-w-[120px] items-center gap-2">
                <span className="h-px flex-1 bg-amber-700/40" />
                <Heart className="h-3 w-3 fill-amber-600 text-amber-600" />
                <span className="h-px flex-1 bg-amber-700/40" />
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ParentPortrait({ parent, index }: { parent: Parent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
      className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-md md:h-36 md:w-36"
    >
      {parent.photo ? (
        <Image
          src={parent.photo}
          alt={parent.name}
          fill
          sizes="(max-width: 768px) 112px, 144px"
          className="object-cover"
        />
      ) : (
        <div className="grid h-full w-full place-items-center bg-amber-100 font-serif text-2xl text-amber-800">
          {parent.name.charAt(0)}
        </div>
      )}
    </motion.div>
  )
}
