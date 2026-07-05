'use client'

import { PriceTag } from '@/components/ui/PriceTag'
import { GiftViewModel } from '@/src/interface-adapters/view-models/gift.view-model'
import { Heart } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = { gift: GiftViewModel; token?: string }

export function GiftCard({ gift, token }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pressed, setPressed] = useState(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setPressed(true)
    startTransition(() =>
      router.push(
        token ? `/presentes/${gift.id}?token=${token}` : `/presentes/${gift.id}`
      )
    )
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -6 }}
      className="overflow-hidden rounded-2xl bg-white shadow-sm"
    >
      <Link
        href={
          token
            ? `/presentes/${gift.id}?token=${token}`
            : `/presentes/${gift.id}`
        }
        onClick={handleClick}
        className="block"
      >
        <div className="relative aspect-square overflow-hidden bg-cream-dark">
          {gift.imageUrl ? (
            <Image
              src={gift.imageUrl}
              alt={gift.name}
              loading="eager"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-muted">
              <Heart className="size-12" />
            </div>
          )}

          <span
            className={`tag-pill absolute left-3 top-3 ${
              gift.status === 'reserved' ? 'tag-reserved' : 'tag-available'
            }`}
          >
            {gift.status === 'reserved' ? '🔒 Reservado' : '✨ Disponível'}
          </span>

          <AnimatePresence>
            {(isPending || pressed) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-cream/85 backdrop-blur-sm"
              >
                <FloatingHeart />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 md:p-5">
          <h3 className="font-display text-lg leading-snug text-ink line-clamp-2 min-h-[3rem]">
            {gift.name}
          </h3>
          {gift.description && (
            <p className="mt-1 text-sm text-ink-muted line-clamp-2">
              {gift.description}
            </p>
          )}
          <div className="mt-4 flex items-end justify-between">
            <PriceTag price={gift.price} prefix="A partir de" size="sm" />
            <motion.span
              whileHover={{ x: 4 }}
              className="text-xs font-medium uppercase tracking-wider text-terracotta"
            >
              Presentear →
            </motion.span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function FloatingHeart() {
  return (
    <motion.div className="relative">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -8, 8, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Heart className="size-12 text-terracotta" fill="currentColor" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: [-10, -30, -50] }}
        transition={{ duration: 1.2, repeat: Infinity }}
        className="absolute -right-3 -top-2"
      >
        <Heart className="size-4 text-terracotta-light" fill="currentColor" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: [-5, -25, -45] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
        className="absolute -left-3 -top-2"
      >
        <Heart className="size-3 text-sage" fill="currentColor" />
      </motion.div>
    </motion.div>
  )
}
