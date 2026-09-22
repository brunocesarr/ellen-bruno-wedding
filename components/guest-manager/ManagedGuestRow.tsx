'use client'

import type { GuestStatus, ManagedGuest } from '@/src/entities/models/guest'
import { GUEST_STATUSES } from '@/src/entities/models/guest'
import { STATUS_LABEL } from '@/src/lib/guests'
import { cn } from '@/src/lib/utils'
import { Check, Pencil, X } from 'lucide-react'
import { useState } from 'react'
import type { PendingUpdate } from './GuestManagerBoard'

const STATUS_STYLE: Record<GuestStatus, string> = {
  going: 'bg-emerald-600 text-white ring-emerald-600',
  pending: 'bg-amber-500 text-white ring-amber-500',
  not_going: 'bg-rose-500 text-white ring-rose-500',
}

/** The dialog's accent follows the meaning of the change, not the row. */
const STATUS_TONE: Record<GuestStatus, PendingUpdate['tone']> = {
  going: 'primary',
  pending: 'neutral',
  not_going: 'danger',
}

type Props = {
  guest: ManagedGuest
  /** True while ANY row's update is in flight — the overlay blocks the page. */
  busy: boolean
  onRequestUpdate: (update: PendingUpdate) => void
}

export function ManagedGuestRow({ guest, busy, onRequestUpdate }: Props) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState(guest.firstName)
  const [lastName, setLastName] = useState(guest.lastName)

  const currentName = `${guest.firstName} ${guest.lastName}`

  const cancelEdit = () => {
    setFirstName(guest.firstName)
    setLastName(guest.lastName)
    setEditing(false)
    setError(null)
  }

  // Client-side guards run BEFORE the dialog: no point asking someone to
  // confirm a change that was never going to be sent.
  const requestRename = () => {
    const first = firstName.trim()
    const last = lastName.trim()

    if (!first || !last) {
      setError('Informe o nome e o sobrenome')
      return
    }
    if (first === guest.firstName && last === guest.lastName) {
      cancelEdit()
      return
    }

    setError(null)
    onRequestUpdate({
      guest,
      patch: { firstName: first, lastName: last },
      tone: 'neutral',
      title: 'Salvar o novo nome?',
      confirmLabel: 'Salvar nome',
      description: (
        <>
          <strong className="text-stone-800">{currentName}</strong> passará a
          aparecer na lista como{' '}
          <strong className="text-stone-800">
            {first} {last}
          </strong>
          .
        </>
      ),
      onDone: () => setEditing(false),
    })
  }

  const requestStatus = (status: GuestStatus) =>
    onRequestUpdate({
      guest,
      patch: { status },
      tone: STATUS_TONE[status],
      title: 'Alterar o status?',
      confirmLabel: 'Alterar status',
      description: (
        <>
          <strong className="text-stone-800">{currentName}</strong> vai de{' '}
          <strong className="text-stone-800">
            {STATUS_LABEL[guest.status]}
          </strong>{' '}
          para{' '}
          <strong className="text-stone-800">{STATUS_LABEL[status]}</strong>.
        </>
      ),
    })

  return (
    <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-label="Primeiro nome"
              maxLength={80}
              className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-amber-600"
            />
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-label="Sobrenome"
              maxLength={80}
              className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-1.5 text-sm outline-none focus:border-amber-600"
            />
            <button
              type="button"
              onClick={requestRename}
              disabled={busy}
              className="inline-flex items-center gap-1 rounded-lg bg-stone-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-stone-900 disabled:opacity-60"
            >
              <Check className="h-3.5 w-3.5" />
              Salvar
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={busy}
              aria-label="Cancelar edição"
              className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            disabled={busy}
            className="group inline-flex items-center gap-2 text-left"
          >
            <span className="truncate text-sm font-medium text-stone-800">
              {currentName}
            </span>
            <Pencil className="h-3.5 w-3.5 shrink-0 text-stone-300 transition group-hover:text-amber-700" />
          </button>
        )}

        {error && (
          <p role="alert" className="mt-1 text-xs text-rose-600">
            {error}
          </p>
        )}
      </div>

      <div
        role="group"
        aria-label={`Status de ${currentName}`}
        className="flex shrink-0 gap-1.5"
      >
        {GUEST_STATUSES.map((status) => {
          const active = guest.status === status
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              disabled={busy || active}
              onClick={() => requestStatus(status)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium ring-1 transition disabled:cursor-default',
                active
                  ? STATUS_STYLE[status]
                  : 'bg-white text-stone-500 ring-stone-200 hover:bg-stone-50 hover:text-stone-800'
              )}
            >
              {STATUS_LABEL[status]}
            </button>
          )
        })}
      </div>
    </li>
  )
}
