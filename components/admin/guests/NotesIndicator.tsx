import { GuestNotesDialog } from '@/components/admin/GuestNotesDialog'
import type { Guest } from '@/src/entities/models/guest'
import { fullName } from '@/src/lib/guests'
import { StickyNote } from 'lucide-react'

export function NotesIndicator({
  guest,
  variant = 'pill',
}: {
  guest: Guest
  variant?: 'pill' | 'button'
}) {
  if (!guest.notes) return variant === 'pill' ? <span>—</span> : null

  const trigger =
    variant === 'pill' ? (
      <button
        type="button"
        aria-label={`Ver observações de ${fullName(guest)}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
      >
        <StickyNote className="h-3.5 w-3.5" />
        <span>Observações</span>
      </button>
    ) : (
      <button
        type="button"
        aria-label={`Ver observações de ${fullName(guest)}`}
        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
      >
        <StickyNote className="h-3.5 w-3.5" /> Observações
      </button>
    )

  return (
    <GuestNotesDialog
      guestName={fullName(guest)}
      notes={guest.notes}
      trigger={trigger}
    />
  )
}
