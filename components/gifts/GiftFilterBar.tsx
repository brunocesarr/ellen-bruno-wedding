'use client'

import { GiftViewModel } from '@/src/interface-adapters/view-models/gift.view-model'
import { AnimatePresence, motion } from 'motion/react'
import { parseAsStringLiteral, useQueryStates } from 'nuqs'
import { GiftGrid } from './GiftGrid'

type Props = { gifts: GiftViewModel[] }

const STATUS_OPTIONS = ['all', 'available', 'reserved'] as const
const SORT_OPTIONS = ['recent', 'price-asc', 'price-desc'] as const
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

export function GiftFilterBar({ gifts }: Props) {
  const [{ status, sort, category }, setQuery] = useQueryStates(
    {
      status: parseAsStringLiteral(STATUS_OPTIONS).withDefault('all'),
      sort: parseAsStringLiteral(SORT_OPTIONS).withDefault('recent'),
      category: parseAsStringLiteral(CATEGORY_OPTIONS).withDefault('all'),
    },
    { shallow: false, history: 'push' }
  )

  // Apply filters
  let filtered = gifts.filter((g) => {
    if (status === 'available' && g.status === 'reserved') return false
    if (status === 'reserved' && g.status !== 'reserved') return false
    if (category !== 'all' && g.category !== category) return false
    return true
  })

  // Apply sort
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'price-asc') return a.price - b.price
    if (sort === 'price-desc') return b.price - a.price
    return 0
  })

  // Counts respect category filter (so chips show how many in current category)
  const inCategory =
    category === 'all' ? gifts : gifts.filter((g) => g.category === category)
  const counts = {
    all: inCategory.length,
    available: inCategory.filter((g) => g.status !== 'reserved').length,
    reserved: inCategory.filter((g) => g.status === 'reserved').length,
  }

  return (
    <div id="lista" className="mx-auto max-w-7xl px-6 py-8">
      {/* Category chips */}
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

      {/* Status + sort */}
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
            <option value="recent">Mais recentes</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
          </select>
        </label>
      </div>

      {/* Animated grid (re-fades on filter change) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${status}-${sort}-${category}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <GiftGrid gifts={filtered} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
