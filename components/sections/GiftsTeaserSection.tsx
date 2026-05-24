'use client'

import { Reveal } from '@/components/ui/Reveal'
import { motion, useReducedMotion } from 'motion/react'
import Image from 'next/image'
import { Button } from '../ui/Button'

export function GiftsTeaserSection() {
  const reduce = useReducedMotion()

  return (
    <section
      id="presentes"
      className="relative overflow-hidden bg-gradient-to-br from-[#faf6ef] via-[#f5efe4] to-[#ede2cd] py-20 md:py-28"
      aria-labelledby="gifts-teaser-title"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          {/* Left — text + CTA */}
          <div className="order-2 md:order-1">
            <Reveal>
              <p className="text-xs uppercase tracking-[0.4em] text-amber-700/80">
                Lista de presentes
              </p>
              <h2
                id="gifts-teaser-title"
                className="mt-3 font-serif text-4xl leading-tight tracking-tight text-amber-900 md:text-5xl"
              >
                Presentes <br />
                <span className="italic">com afeto</span>
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-stone-600 md:text-lg">
                Sua presença já é o nosso maior presente, mas se você desejar
                contribuir com algo que celebre o início da nossa nova vida
                juntos, preparamos esta lista com muito carinho. Pague de forma
                simples e segura via{' '}
                <strong className="text-amber-800">Pix</strong>.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <motion.a
                  href="/presentes"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block"
                >
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="min-w-fit min-h-4 mt-6 hover:cursor-pointer"
                  >
                    Ver presentes
                  </Button>
                </motion.a>
              </div>
            </Reveal>
          </div>

          {/* Right — polaroid stack inspired by image 3 of /presentes */}
          <div className="relative order-1 mx-auto h-[340px] w-full max-w-md md:order-2 md:h-[420px]">
            {[0, 1, 2].map((i) => {
              const transforms = [
                'rotate-[-8deg] translate-x-0 translate-y-0',
                'rotate-[5deg] translate-x-12 translate-y-6 md:translate-x-20',
                'rotate-[-3deg] translate-x-24 translate-y-12 md:translate-x-40 md:translate-y-16',
              ]
              const labels = ['emoção', 'amor', 'para sempre']

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: reduce ? 0 : 30, rotate: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    duration: 0.7,
                    delay: 0.2 + i * 0.15,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={`absolute left-0 top-0 h-56 w-44 bg-white p-3 pb-10 shadow-xl transition-transform md:h-72 md:w-56 ${transforms[i]}`}
                  style={{ zIndex: i + 1 }}
                >
                  <div className="relative h-full w-full overflow-hidden bg-amber-50">
                    <Image
                      src={`/images/polaroids/eb-${i + 1}.jpg`}
                      alt={`E&B ${labels[i]}`}
                      fill
                      sizes="(max-width: 768px) 176px, 224px"
                      className="object-cover"
                    />
                  </div>
                  <p className="absolute bottom-2 left-0 right-0 text-center font-serif text-sm italic text-stone-600">
                    {labels[i]}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Decorative blurs */}
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
    </section>
  )
}
