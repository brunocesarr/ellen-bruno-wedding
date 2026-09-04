'use client'

import { assignGuestPartyAction } from '@/app/admin/_actions/guests.actions'
import { DialogShell } from '@/components/ui/DialogShell'
import type { Guest } from '@/src/entities/models/guest'
import { fullName } from '@/src/lib/guests'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, Search, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'

type Props = {
  guest: Guest
  allGuests: Guest[]
  trigger: React.ReactNode
  onMoved: (guest: Guest) => void
}

export function MoveGuestDialog({ guest, allGuests, trigger, onMoved }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allGuests
      .filter((g) => g.id !== guest.id && g.partyId !== guest.partyId)
      .filter((g) => !q || fullName(g).toLowerCase().includes(q))
      .sort((a, b) => fullName(a).localeCompare(fullName(b), 'pt-BR'))
      .slice(0, 20)
  }, [allGuests, guest.id, guest.partyId, query])

  const handlePick = async (target: Guest) => {
    setError(null)
    setMovingId(target.id)

    const res = await assignGuestPartyAction({
      guestId: guest.id,
      targetGuestId: target.id,
    })

    setMovingId(null)
    if (!res.ok) {
      setError(res.error)
      return
    }
    onMoved(res.data)
    setOpen(false)
  }

  return (
    <DialogShell
      trigger={trigger}
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          setQuery('')
          setError(null)
        }
      }}
      contentClassName="max-h-[80vh] w-[92vw] max-w-md"
    >
      <header className="flex items-start justify-between border-b border-stone-100 px-5 py-4">
        <div>
          <Dialog.Title className="font-serif text-lg text-stone-900">
            Mover para outro grupo
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-stone-500">
            {fullName(guest)} passará a fazer parte do grupo do convidado
            selecionado.
          </Dialog.Description>
        </div>

        <Dialog.Close
          className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Dialog.Close>
      </header>

      <div className="p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar convidado..."
            className="w-full rounded-full border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-600"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        <ul className="mt-3 max-h-72 space-y-1 overflow-y-auto">
          {candidates.length === 0 && (
            <li className="px-2 py-6 text-center text-sm text-stone-400">
              Nenhum convidado encontrado.
            </li>
          )}
          {candidates.map((g) => (
            <li key={g.id}>
              <button
                type="button"
                disabled={movingId !== null}
                onClick={() => handlePick(g)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Users className="h-3.5 w-3.5 flex-shrink-0 text-stone-400" />
                <span className="flex-1 truncate">{fullName(g)}</span>
                {movingId === g.id && (
                  <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </DialogShell>
  )
}
