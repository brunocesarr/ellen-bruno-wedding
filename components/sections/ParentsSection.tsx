'use client'

import { Reveal } from '@/components/ui/Reveal'
import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

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
      { name: 'Maria Cleuza Martins Lopes' },
      { name: 'Walter Alves Lopes' },
    ],
  },
  {
    side: 'Pais do noivo',
    coupleName: 'Família Bruno',
    parents: [{ name: 'Aleluia Moreira Alves Silva' }, { name: 'André Silva' }],
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
