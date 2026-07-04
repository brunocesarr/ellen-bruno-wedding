import { GuestFormDialog } from '@/components/admin/GuestFormDialog'
import { StatusPill } from '@/components/admin/StatusPill'
import type { Guest } from '@/src/entities/models/guest'
import {
  STATUS_LABEL,
  STATUS_PILL,
  fullName,
  type GuestListCallbacks,
} from '@/src/lib/guests'
import { Copy, Link as LinkIcon, Pencil, Trash2 } from 'lucide-react'
import { NotesIndicator } from './NotesIndicator'

type Props = { guest: Guest; isHead: boolean } & GuestListCallbacks

export function GuestMobileCard({
  guest,
  isHead,
  copiedToken,
  onCopyInvite,
  onRequestDelete,
  onSaved,
}: Props) {
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
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <NotesIndicator guest={guest} variant="button" />

        <button
          type="button"
          onClick={() => onCopyInvite(guest.inviteToken)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-sm text-stone-700"
        >
          {copiedToken === guest.inviteToken ? (
            <>
              <LinkIcon className="h-3.5 w-3.5 text-emerald-600" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Link individual
            </>
          )}
        </button>

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
          onClick={() => onRequestDelete(guest)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm text-rose-700"
        >
          <Trash2 className="h-3.5 w-3.5" /> Remover
        </button>
      </div>
    </article>
  )
}
