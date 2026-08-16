'use client'

import {
  compareAmount,
  compareName,
  rankGiftsForGuest,
} from '@/src/interface-adapters/view-models/gift-ranking'
import {
  isGiftClosed,
  type GiftViewModel,
} from '@/src/interface-adapters/view-models/gift.view-model'
import { AnimatePresence, motion } from 'motion/react'
import { parseAsStringLiteral, useQueryStates } from 'nuqs'
import { GiftGrid } from './GiftGrid'

type Props = { gifts: GiftViewModel[]; token?: string }

const STATUS_OPTIONS = ['all', 'available', 'reserved'] as const
const SORT_OPTIONS = [
  'recommended',
  'recent',
  'price-asc',
  'price-desc',
  'name-asc',
  'name-desc',
] as const
const CATEGORY_OPTIONS = [
  'all',
  'home',
  'kitchen',
  'travel',
  'experience',
  'other',
] as const

const STATUS_LABELS: Record<(typeof STATUS_OPTIONS)[number], string> = {
  all: 'Todos',
  available: 'Disponíveis',
  reserved: 'Já reservados',
}

const CATEGORY_LABELS: Record<(typeof CATEGORY_OPTIONS)[number], string> = {
  all: '✨ Todas',
  home: '🏠 Casa',
  kitchen: '🍳 Cozinha',
  travel: '✈️ Viagem',
  experience: '💝 Experiências',
  other: '🎁 Outros',
}

export function GiftFilterBar({ gifts, token }: Props) {
  const [{ status, sort, category }, setQuery] = useQueryStates(
    {
      status: parseAsStringLiteral(STATUS_OPTIONS).withDefault('all'),
      sort: parseAsStringLiteral(SORT_OPTIONS).withDefault('recommended'),
      category: parseAsStringLiteral(CATEGORY_OPTIONS).withDefault('all'),
    },
    { shallow: false, history: 'push' }
  )

  // Funds never lock, so they must never be filtered out as "reserved" — they
  // always accept another contribution. A raw `status === 'reserved'` check
  // would hide any fund that has already received money (status 'thanked').
  let filtered = gifts.filter((gift) => {
    if (status === 'available' && isGiftClosed(gift)) return false
    if (status === 'reserved' && !isGiftClosed(gift)) return false
    if (category !== 'all' && gift.category !== category) return false
    return true
  })

  // Ranking runs after filtering so price bands are computed from what the guest
  // can actually see — a category view rebands against its own price range.
  if (sort === 'recommended') {
    filtered = rankGiftsForGuest(filtered)
  } else if (sort === 'price-asc') {
    filtered = [...filtered].sort((a, b) => compareAmount(a, b, 'asc'))
  } else if (sort === 'price-desc') {
    filtered = [...filtered].sort((a, b) => compareAmount(a, b, 'desc'))
  } else if (sort === 'name-asc') {
    filtered = [...filtered].sort((a, b) => compareName(a, b, 'asc'))
  } else if (sort === 'name-desc') {
    filtered = [...filtered].sort((a, b) => compareName(a, b, 'desc'))
  }
  // 'recent' keeps repository order (created_at desc).

  const inCategory =
    category === 'all'
      ? gifts
      : gifts.filter((gift) => gift.category === category)

  const counts = {
    all: inCategory.length,
    available: inCategory.filter((gift) => !isGiftClosed(gift)).length,
    reserved: inCategory.filter((gift) => isGiftClosed(gift)).length,
  }

  return (
    <div id="lista" className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((cat) => (
          <button
            key={cat}
            onClick={() => setQuery({ category: cat })}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              category === cat
                ? 'bg-terracotta text-cream shadow-sm'
                : 'bg-white text-ink hover:bg-terracotta-light/30'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 border-b border-ink/10 pb-4 md:flex-row md:items-center">
        <div role="tablist" className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((key) => (
            <button
              key={key}
              role="tab"
              aria-selected={status === key}
              onClick={() => setQuery({ status: key })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                status === key
                  ? 'bg-ink text-cream'
                  : 'bg-cream-dark text-ink hover:bg-terracotta-light/30'
              }`}
            >
              {STATUS_LABELS[key]}{' '}
              <span className="ml-1 text-xs opacity-70">({counts[key]})</span>
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-ink-muted">
          Ordenar por
          <select
            value={sort}
            onChange={(e) => setQuery({ sort: e.target.value as typeof sort })}
            className="rounded-md border border-ink/15 bg-white px-3 py-1.5 text-sm text-ink focus:border-terracotta focus:outline-none"
          >
            <option value="recommended">Sugeridos</option>
            <option value="recent">Mais recentes</option>
            <option value="price-asc">Menor valor</option>
            <option value="price-desc">Maior valor</option>
            <option value="name-asc">Nome (A–Z)</option>
            <option value="name-desc">Nome (Z–A)</option>
          </select>
        </label>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${status}-${sort}-${category}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <GiftGrid gifts={filtered} token={token} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
