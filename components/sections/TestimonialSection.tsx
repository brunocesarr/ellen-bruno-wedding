'use client'

import { Reveal } from '@/components/ui/Reveal'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCallback, useEffect, useState } from 'react'

type Testimonial = {
  quote: string
  author: string
  context?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'Para que todos vejam, e saimba, e considerem, e juntamente entendam que a mão do Senhor fez isso, e o santo de Isral o criou',
    author: 'Isaias 41:20',
    context: 'Ellen & Bruno',
  },
]

export function TestimonialSection() {
  const [index, setIndex] = useState(0)
  const reduce = useReducedMotion()

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % TESTIMONIALS.length)
  }, [])

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }, [])

  // Auto-advance every 8 seconds (pause on reduced motion)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(next, 8000)
    return () => clearInterval(t)
  }, [next, reduce])

  const current = TESTIMONIALS[index]

  if (!current) return null

  return (
    <section
      id="depoimentos"
      className="relative overflow-hidden bg-gradient-to-b from-[#faf6ef] to-[#f5efe4] py-20 md:py-28"
      aria-labelledby="testimonial-title"
    >
      {/* Decorative scroll lines (subtle) */}
      <div className="absolute inset-x-0 top-12 h-px bg-amber-700/10 md:top-16" />
      <div className="absolute inset-x-0 bottom-12 h-px bg-amber-700/10 md:bottom-16" />

      <div className="mx-auto max-w-4xl px-6">
        <Reveal className="text-center">
          <Quote className="mx-auto h-8 w-8 text-amber-600/60" aria-hidden />
          <h2
            id="testimonial-title"
            className="mt-4 font-serif text-3xl tracking-[0.15em] text-amber-900 md:text-4xl"
          >
            ...
          </h2>
        </Reveal>

        {/* Carousel */}
        <div className="relative mt-12 md:mt-16">
          <div className="flex items-center justify-center gap-3 md:gap-6">
            {TESTIMONIALS.length > 1 && (
              <button
                type="button"
                onClick={prev}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-amber-800 transition hover:bg-amber-100 md:h-12 md:w-12"
                aria-label="Depoimento anterior"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            )}

            <div className="relative min-h-[200px] flex-1 md:min-h-[240px]">
              <AnimatePresence mode="wait">
                <motion.figure
                  key={index}
                  initial={{ opacity: 0, x: reduce ? 0 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: reduce ? 0 : -30 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <blockquote className="font-serif text-xl italic leading-relaxed text-stone-700 md:text-2xl">
                    "{current.quote}"
                  </blockquote>
                  <figcaption className="mt-6 space-y-1">
                    <p className="font-serif text-base text-amber-800 md:text-lg">
                      — {current.author}
                    </p>
                    {current.context && (
                      <p className="text-xs uppercase tracking-[0.3em] text-stone-400">
                        {current.context}
                      </p>
                    )}
                  </figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            {TESTIMONIALS.length > 1 && (
              <button
                type="button"
                onClick={next}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-amber-800 transition hover:bg-amber-100 md:h-12 md:w-12"
                aria-label="Próximo depoimento"
              >
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            )}
          </div>

          {/* Pagination dots */}
          <div className="mt-8 flex justify-center gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ir para depoimento ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${
                  i === index
                    ? 'w-8 bg-amber-700'
                    : 'w-1.5 bg-amber-700/30 hover:bg-amber-700/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
