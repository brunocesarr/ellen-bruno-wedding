'use client'

import { GuestFormDialog } from '@/components/admin/GuestFormDialog'
import { PartyCard } from '@/components/admin/guests/PartyCard'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Counter } from '@/components/ui/Counter'
import { EmptyState } from '@/components/ui/EmptyState'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useGuestDeletion } from '@/hooks/useGuestDeletion'
import type { Guest, GuestStatus } from '@/src/entities/models/guest'
import { buttonPrimary } from '@/src/lib/class-names'
import {
  filterPartyMembers,
  fullName,
  groupByParty,
  inviteUrlFor,
  partyMatchesQuery,
  type Party,
  type StatusFilter,
} from '@/src/lib/guests'
import { Search, UserPlus, Users } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

export function GuestsTable({ guests }: { guests: Guest[] }) {
  const [list, setList] = useState<Guest[]>(guests)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const { copiedValue: copiedToken, copy } = useCopyToClipboard()

  const deletion = useGuestDeletion({
    onSuccess: (id) => setList((prev) => prev.filter((g) => g.id !== id)),
  })

  const parties = useMemo(
    () =>
      groupByParty(list)
        .map((p) => filterPartyMembers(p, statusFilter))
        .filter((p): p is Party => p !== null)
        .filter((p) => partyMatchesQuery(p, query)),
    [list, query, statusFilter]
  )

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

  const handleSaved = useCallback((saved: Guest) => {
    setList((prev) => {
      const exists = prev.some((g) => g.id === saved.id)
      return exists
        ? prev.map((g) => (g.id === saved.id ? saved : g))
        : [saved, ...prev]
    })
  }, [])

  const handleCopyInvite = useCallback(
    (token: string) => copy(inviteUrlFor(token), token),
    [copy]
  )

  if (!list.length) {
    return (
      <EmptyState
        icon={<Users className="h-4 w-4" />}
        title="Nenhum convidado cadastrado"
        description="Comece adicionando o primeiro convidado para gerar o link individual de convite."
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Buscar por nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm outline-none focus:border-amber-600"
        >
          <option value="all">Todos os status</option>
          <option value="going">Confirmados</option>
          <option value="pending">Pendentes</option>
          <option value="not_going">Não vai</option>
        </select>

        <GuestFormDialog
          onSaved={handleSaved}
          trigger={
            <button type="button" className={buttonPrimary}>
              <UserPlus className="h-4 w-4" />
              Novo convidado
            </button>
          }
        />
      </div>

      {/* Counters */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Counter label="Total" value={list.length} tone="neutral" />
        <Counter label="Confirmados" value={totals.going} tone="emerald" />
        <Counter label="Pendentes" value={totals.pending} tone="amber" />
        <Counter label="Não vão" value={totals.not_going} tone="rose" />
      </div>

      {/* Parties */}
      {parties.length === 0 ? (
        <EmptyState
          icon={<Search className="h-4 w-4" />}
          title="Nenhum convidado encontrado"
          description="Ajuste os filtros ou tente outro nome."
        />
      ) : (
        <div className="space-y-4">
          {parties.map((party) => (
            <PartyCard
              key={party.partyId}
              party={party}
              copiedToken={copiedToken}
              onCopyInvite={handleCopyInvite}
              onRequestDelete={deletion.request}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deletion.isOpen}
        onOpenChange={(open) => (open ? null : deletion.cancel())}
        tone="danger"
        pending={deletion.pending}
        title="Remover convidado?"
        description={
          deletion.target ? (
            <>
              Esta ação não pode ser desfeita.{' '}
              <strong className="text-stone-800">
                {fullName(deletion.target)}
              </strong>{' '}
              será removido(a) da lista e perderá o acesso ao convite.
            </>
          ) : null
        }
        confirmLabel={deletion.pending ? 'Removendo...' : 'Remover'}
        cancelLabel="Cancelar"
        onConfirm={deletion.confirm}
      />
    </div>
  )
}
