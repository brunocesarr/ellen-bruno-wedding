'use client'

import { RsvpViewModel } from '@/src/interface-adapters/view-models/rsvp.view-model'
import { HeartHandshake, Mail, Phone, Search, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { EmptyState } from '../ui/EmptyState'
import { StatusPill } from './StatusPill'

const TABS = [
  { id: 'all', label: 'Todos' },
  { id: 'confirmed', label: 'Confirmados' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'declined', label: 'Recusados' },
] as const

export function ConfirmationsList({ items }: { items: RsvpViewModel[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return items.filter((c) => {
      const matchT = tab === 'all' || c.status === tab
      const matchQ =
        !query || c.guestName.toLowerCase().includes(query.toLowerCase())
      return matchT && matchQ
    })
  }, [items, tab, query])

  if (!items.length) {
    return (
      <EmptyState
        icon={<HeartHandshake className="w-12 h-12" />}
        title="Ainda sem confirmações"
        description="As confirmações aparecerão aqui assim que os convidados responderem."
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Tabs + search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1 rounded-full bg-stone-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${
                tab === t.id
                  ? 'text-amber-900'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="conf-tab"
                  className="absolute inset-0 rounded-full bg-white shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="relative md:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar convidado..."
            className="w-full rounded-full border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((c, i) => (
            <motion.article
              key={c.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="rounded-2xl border border-stone-200 bg-white p-5 transition hover:shadow-md"
            >
              <header className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-amber-100 font-serif text-lg text-amber-800">
                    {c.guestName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-stone-900">
                      {c.guestName}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-stone-500">
                      <Users className="h-3 w-3" /> {c.guestsCount}{' '}
                      {c.guestsCount === 1 ? 'pessoa' : 'pessoas'}
                    </p>
                  </div>
                </div>
                <StatusPill status={c.status} />
              </header>

              {(c.email || c.phone) && (
                <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                  {c.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-stone-400" /> {c.email}
                    </p>
                  )}
                  {c.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-stone-400" /> {c.phone}
                    </p>
                  )}
                </div>
              )}

              {c.message && (
                <blockquote className="mt-4 rounded-lg bg-amber-50/60 p-3 text-sm italic text-stone-700">
                  "{c.message}"
                </blockquote>
              )}

              {c.respondedAt && (
                <footer className="mt-4 text-xs text-stone-400">
                  Respondeu em{' '}
                  {new Date(c.respondedAt).toLocaleDateString('pt-BR')}
                </footer>
              )}
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
