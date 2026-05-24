'use client'

import { BrushStroke } from '@/components/ui/BrushStroke'
import { PriceTag } from '@/components/ui/PriceTag'
import type { GiftView } from '@/src/interface-adapters/controllers/gifts/list-gifts.controller'
import { ArrowLeft, Heart } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

type Props = { gift: GiftView }

export function GiftDetailHero({ gift }: Props) {
  return (
    <section className="relative cream-grain">
      <BrushStroke
        color="terracotta"
        className="absolute -left-4 top-12 hidden h-12 w-44 md:block"
      />
      <BrushStroke
        color="sage"
        className="absolute right-12 bottom-8 hidden h-10 w-40 md:block"
      />

      <div className="mx-auto max-w-7xl px-6 py-8 md:py-12">
        <Link
          href="/presentes"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-muted transition hover:text-terracotta"
        >
          <ArrowLeft className="size-4" />
          Voltar para a lista
        </Link>

        <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16">
          {/* ── Image (large, polaroid-style) ───────────── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.9, 0.3, 1] }}
            className="relative"
          >
            <div className="polaroid relative aspect-[4/5] overflow-hidden">
              {gift.imageUrl ? (
                <Image
                  src={gift.imageUrl}
                  alt={gift.name}
                  loading="eager"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-cream-dark">
                  <Heart className="size-16 text-ink-muted/40" />
                </div>
              )}
            </div>

            {/* Decorative dot */}
            <span
              aria-hidden
              className="absolute -right-3 -top-3 size-6 rounded-full bg-terracotta-light/50"
            />
          </motion.div>

          {/* ── Info column ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <span
              className={`tag-pill self-start ${
                gift.isReserved ? 'tag-reserved' : 'tag-available'
              }`}
            >
              {gift.isReserved ? '🔒 Reservado' : '✨ Disponível'}
            </span>

            <h1 className="mt-4 font-display text-4xl leading-tight text-ink md:text-5xl">
              {gift.name}
            </h1>

            {gift.description && (
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                {gift.description}
              </p>
            )}

            <div className="mt-8">
              <PriceTag price={gift.price} prefix="Valor sugerido" size="md" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
