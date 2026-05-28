'use client'

import { deleteGuestAction } from '@/app/admin/_actions/guests.actions'
import type { Guest, GuestStatus } from '@/src/entities/models/guest'
import { isNonEmpty } from '@/types/types'
import {
  Copy,
  Link as LinkIcon,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { EmptyState } from '../ui/EmptyState'
import { GuestFormDialog } from './GuestFormDialog'
import { StatusPill } from './StatusPill'

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                   */
/* ------------------------------------------------------------------ */

type StatusFilter = 'all' | GuestStatus

type NonEmptyArray<T> = readonly [T, ...T[]]

type Party = {
  partyId: string
  members: NonEmptyArray<Guest>
}

/** Local label/tone reuse — maps domain status -> existing StatusPill tone. */
const STATUS_PILL: Record<GuestStatus, 'confirmed' | 'pending' | 'declined'> = {
  going: 'confirmed',
  pending: 'pending',
  not_going: 'declined',
}

const STATUS_LABEL: Record<GuestStatus, string> = {
  going: 'Confirmado',
  pending: 'Pendente',
  not_going: 'Não vai',
}

function fullName(g: Guest) {
  return `${g.firstName} ${g.lastName}`.trim()
}

function inviteUrlFor(token: string) {
  if (typeof window === 'undefined') return `/invite?token=${token}`
  return `${window.location.origin}/invite?token=${token}`
}

function groupByParty(guests: Guest[]): Party[] {
  const map = new Map<string, Guest[]>()
  for (const g of guests) {
    const list = map.get(g.partyId) ?? []
    list.push(g)
    map.set(g.partyId, list)
  }

  const parties: Party[] = []
  for (const [partyId, members] of map) {
    if (members.length === 0) continue // makes the type guard explicit

    const sorted = [...members].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )

    if (!isNonEmpty(sorted)) continue

    parties.push({ partyId, members: sorted })
  }

  return parties.sort(
    (a, b) =>
      a.members[0].createdAt.getTime() - b.members[0].createdAt.getTime()
  )
}

function partyMatchesQuery(party: Party, q: string) {
  if (!q) return true
  const needle = q.toLowerCase()
  return party.members.some((m) => fullName(m).toLowerCase().includes(needle))
}

function filterPartyMembers(party: Party, status: StatusFilter): Party | null {
  if (status === 'all') return party
  const members = party.members.filter((m) => m.status === status)
  if (members.length === 0) return null
  if (!isNonEmpty(members)) return null
  return {
    ...party,
    members: members,
  }
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export function GuestsTable({ guests }: { guests: Guest[] }) {
  const [list, setList] = useState<Guest[]>(guests)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const parties = useMemo(() => {
    return groupByParty(list)
      .map((p) => filterPartyMembers(p, statusFilter))
      .filter((p): p is Party => p !== null)
      .filter((p) => partyMatchesQuery(p, query))
  }, [list, query, statusFilter])

  const totals = useMemo(() => {
    return list.reduce(
      (acc, g) => {
        acc[g.status] += 1
        return acc
      },
      { going: 0, pending: 0, not_going: 0 } as Record<GuestStatus, number>
    )
  }, [list])

  function handleSaved(saved: Guest) {
    setList((prev) => {
      const exists = prev.some((g) => g.id === saved.id)
      return exists
        ? prev.map((g) => (g.id === saved.id ? saved : g))
        : [saved, ...prev]
    })
  }

  function handleDelete(g: Guest) {
    if (!confirm(`Remover "${fullName(g)}"?`)) return
    setPendingId(g.id)
    startTransition(async () => {
      const res = await deleteGuestAction(g.id)
      if (res.ok) setList((prev) => prev.filter((x) => x.id !== g.id))
      setPendingId(null)
    })
  }

  async function handleCopyInvite(token: string) {
    const url = inviteUrlFor(token)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedToken(token)
      setTimeout(() => setCopiedToken(null), 1800)
    } catch {
      window.prompt('Copie o link do convite:', url)
    }
  }

  if (!list.length) {
    return (
      <>
        <GuestFormDialog
          onSaved={handleSaved}
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
            >
              <UserPlus className="h-4 w-4" />
              Novo convidado
            </button>
          }
        />
        <EmptyState
          icon={<Users className="h-4 w-4" />}
          title="Nenhum convidado cadastrado"
          description="Comece adicionando o primeiro convidado para gerar o link individual de convite."
        />
      </>
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
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600"
            >
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
              pendingId={pendingId}
              onCopyInvite={handleCopyInvite}
              onDelete={handleDelete}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Party card (groups associated guests)                             */
/* ------------------------------------------------------------------ */

function PartyCard({
  party,
  copiedToken,
  pendingId,
  onCopyInvite,
  onDelete,
  onSaved,
}: {
  party: Party
  copiedToken: string | null
  pendingId: string | null
  onCopyInvite: (token: string) => void
  onDelete: (g: Guest) => void
  onSaved: (g: Guest) => void
}) {
  const [head, ...companions] = party.members

  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 bg-stone-50/60 px-4 py-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
          <Users className="h-3.5 w-3.5" />
          <span>
            Grupo · {party.members.length}{' '}
            {party.members.length === 1 ? 'convidado' : 'convidados'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onCopyInvite(head.inviteToken)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50"
            title="Copiar link do convite"
          >
            {copiedToken === head.inviteToken ? (
              <>
                <LinkIcon className="h-3.5 w-3.5 text-emerald-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar convite
              </>
            )}
          </button>

          <GuestFormDialog
            parentPartyId={party.partyId}
            onSaved={onSaved}
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Adicionar acompanhante
              </button>
            }
          />
        </div>
      </header>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
              <th className="px-4 py-3 font-medium">Convidado</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Confirmado em</th>
              <th className="px-4 py-3 font-medium">Observações</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            <GuestRow
              guest={head}
              isHead
              pendingId={pendingId}
              onDelete={onDelete}
              onSaved={onSaved}
            />
            {companions.map((g) => (
              <GuestRow
                key={g.id}
                guest={g}
                pendingId={pendingId}
                onDelete={onDelete}
                onSaved={onSaved}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 p-3 md:hidden">
        {party.members.map((g) => (
          <GuestMobileCard
            key={g.id}
            guest={g}
            isHead={g.id === head.id}
            pendingId={pendingId}
            onDelete={onDelete}
            onSaved={onSaved}
          />
        ))}
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/*  Single guest row (desktop)                                        */
/* ------------------------------------------------------------------ */

function GuestRow({
  guest,
  isHead,
  pendingId,
  onDelete,
  onSaved,
}: {
  guest: Guest
  isHead?: boolean
  pendingId: string | null
  onDelete: (g: Guest) => void
  onSaved: (g: Guest) => void
}) {
  const isDeleting = pendingId === guest.id

  return (
    <tr className="transition-colors hover:bg-stone-50/60">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-amber-100 font-serif text-sm text-amber-800">
            {guest.firstName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-medium text-stone-800">{fullName(guest)}</p>
            {isHead ? (
              <p className="text-[11px] uppercase tracking-wider text-amber-700">
                Titular do convite
              </p>
            ) : (
              <p className="text-[11px] text-stone-400">Acompanhante</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <StatusPill status={STATUS_PILL[guest.status]} />
      </td>

      <td className="px-4 py-3 text-stone-500">
        {guest.confirmedAt
          ? guest.confirmedAt.toLocaleDateString('pt-BR')
          : '—'}
      </td>

      <td className="px-4 py-3 text-stone-500">
        <span className="line-clamp-1">{guest.notes ?? '—'}</span>
      </td>

      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <GuestFormDialog
            guest={guest}
            onSaved={onSaved}
            trigger={
              <button
                type="button"
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
                aria-label="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
            }
          />
          <button
            type="button"
            onClick={() => onDelete(guest)}
            disabled={isDeleting}
            className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50 disabled:opacity-50"
            aria-label="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ------------------------------------------------------------------ */
/*  Single guest card (mobile)                                        */
/* ------------------------------------------------------------------ */

function GuestMobileCard({
  guest,
  isHead,
  pendingId,
  onDelete,
  onSaved,
}: {
  guest: Guest
  isHead: boolean
  pendingId: string | null
  onDelete: (g: Guest) => void
  onSaved: (g: Guest) => void
}) {
  const isDeleting = pendingId === guest.id

  return (
    <article className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-amber-100 font-serif text-sm text-amber-800">
          {guest.firstName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-stone-800">{fullName(guest)}</p>
            <StatusPill status={STATUS_PILL[guest.status]} />
          </div>
          <p className="mt-0.5 text-xs text-stone-500">
            {isHead ? 'Titular do convite' : 'Acompanhante'} ·{' '}
            {STATUS_LABEL[guest.status]}
          </p>
          {guest.notes && (
            <p className="mt-2 line-clamp-2 text-xs text-stone-500">
              {guest.notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <GuestFormDialog
          guest={guest}
          onSaved={onSaved}
          trigger={
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-sm text-stone-700"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
          }
        />
        <button
          type="button"
          onClick={() => onDelete(guest)}
          disabled={isDeleting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm text-rose-700 disabled:opacity-50"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remover
        </button>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ */
/*  Counter pill                                                      */
/* ------------------------------------------------------------------ */

function Counter({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'neutral' | 'emerald' | 'amber' | 'rose'
}) {
  const tones: Record<typeof tone, string> = {
    neutral: 'bg-stone-100 text-stone-700 ring-stone-200',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-800 ring-amber-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${tones[tone]}`}
    >
      {label}
      <span className="tabular-nums">{value}</span>
    </span>
  )
}
