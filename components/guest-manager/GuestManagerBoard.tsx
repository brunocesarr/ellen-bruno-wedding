'use client'

import { updateManagedGuestAction } from '@/app/(public)/_actions/guest-manager.actions'
import { ManagedGuestRow } from '@/components/guest-manager/ManagedGuestRow'
import { BusyOverlay } from '@/components/ui/BusyOverlay'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { GuestStatus, ManagedGuest } from '@/src/entities/models/guest'
import { STATUS_LABEL, type StatusFilter } from '@/src/lib/guests'
import { cn } from '@/src/lib/utils'
import { Search, Users } from 'lucide-react'
import { useMemo, useState, useTransition, type ReactNode } from 'react'

/**
 * A change a row has asked for but nobody has confirmed yet. Rows never call
 * the server themselves: they describe the change, the board confirms it, runs
 * it, and dims the page while it is in flight.
 */
export type PendingUpdate = {
  guest: ManagedGuest
  patch: { firstName: string; lastName: string } | { status: GuestStatus }
  title: string
  description: ReactNode
  confirmLabel: string
  tone: 'primary' | 'danger' | 'neutral'
  /** Lets the requesting row clean up (e.g. leave edit mode) on success. */
  onDone?: () => void
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'going', label: STATUS_LABEL.going },
  { key: 'pending', label: STATUS_LABEL.pending },
  { key: 'not_going', label: STATUS_LABEL.not_going },
]

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d)

type Props = {
  token: string
  label: string
  expiresAt: Date | null
  guests: ManagedGuest[]
}

export function GuestManagerBoard({ token, label, expiresAt, guests }: Props) {
  const [list, setList] = useState(guests)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')

  const [update, setUpdate] = useState<PendingUpdate | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()

  const totals = useMemo(
    () =>
      list.reduce(
        (acc, g) => {
          acc[g.status] += 1
          return acc
        },
        { going: 0, pending: 0, not_going: 0 } as Record<GuestStatus, number>
      ),
    [list]
  )

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return list
      .filter((g) => filter === 'all' || g.status === filter)
      .filter(
        (g) => !q || `${g.firstName} ${g.lastName}`.toLowerCase().includes(q)
      )
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
          'pt-BR',
          { sensitivity: 'base' }
        )
      )
  }, [list, filter, query])

  const requestUpdate = (next: PendingUpdate) => {
    setError(null)
    setUpdate(next)
  }

  const confirmUpdate = () => {
    if (!update) return
    setError(null)

    startSaving(async () => {
      const res = await updateManagedGuestAction({
        token,
        guestId: update.guest.id,
        ...update.patch,
      })

      // Keep the dialog open on failure so the reason stays attached to the
      // change the person was trying to make.
      if (!res.ok) {
        setError(res.error)
        return
      }

      setList((prev) => prev.map((g) => (g.id === res.data.id ? res.data : g)))
      update.onDone?.()
      setUpdate(null)
    })
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-8 md:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700"
            >
              <Users className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="font-serif text-2xl text-stone-900">
                Lista de convidados
              </h1>
              <p className="mt-1 text-sm text-stone-500">
                Acesso de <strong className="text-stone-700">{label}</strong>.
                Você pode corrigir nomes e mudar o status de quem já está na
                lista — adicionar ou remover convidados continua com os noivos.
              </p>
              {expiresAt && (
                <p className="mt-2 text-xs text-stone-400">
                  Este acesso expira em {fmtDate(expiresAt)}.
                </p>
              )}
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-stone-100 pt-4 text-center">
            {(['going', 'pending', 'not_going'] as const).map((status) => (
              <div key={status}>
                <dt className="text-xs uppercase tracking-wider text-stone-400">
                  {STATUS_LABEL[status]}
                </dt>
                <dd className="mt-1 font-serif text-2xl text-stone-800">
                  {totals[status]}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome..."
              aria-label="Buscar convidado por nome"
              className="w-full rounded-full border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-600"
            />
          </div>

          <div
            role="group"
            aria-label="Filtrar por status"
            className="flex gap-1.5"
          >
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition',
                  filter === f.key
                    ? 'bg-stone-800 text-white ring-stone-800'
                    : 'bg-white text-stone-600 ring-stone-200 hover:bg-stone-50'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
            Nenhum convidado encontrado com esses filtros.
          </p>
        ) : (
          <ul className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {visible.map((guest) => (
              <ManagedGuestRow
                key={guest.id}
                guest={guest}
                busy={saving}
                onRequestUpdate={requestUpdate}
              />
            ))}
          </ul>
        )}
      </div>

      {update && (
        <ConfirmDialog
          open
          onOpenChange={(next) => {
            if (next) return
            setUpdate(null)
            setError(null)
          }}
          title={update.title}
          description={update.description}
          confirmLabel={update.confirmLabel}
          pendingLabel="Salvando..."
          tone={update.tone}
          pending={saving}
          error={error}
          onConfirm={confirmUpdate}
        />
      )}

      <BusyOverlay show={saving} message="Salvando alteração..." />
    </main>
  )
}
