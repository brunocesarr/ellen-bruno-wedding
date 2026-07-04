import { GuestFormDialog } from '@/components/admin/GuestFormDialog'
import { StatusPill } from '@/components/admin/StatusPill'
import type { Guest } from '@/src/entities/models/guest'
import { STATUS_PILL, fullName, type GuestListCallbacks } from '@/src/lib/guests'
import { Copy, Link as LinkIcon, Pencil, Trash2 } from 'lucide-react'
import { NotesIndicator } from './NotesIndicator'

type Props = { guest: Guest; isHead?: boolean } & GuestListCallbacks

export function GuestRow({
  guest,
  isHead,
  copiedToken,
  onCopyInvite,
  onRequestDelete,
  onSaved,
}: Props) {
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
        <NotesIndicator guest={guest} />
      </td>

      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => onCopyInvite(guest.inviteToken)}
            className="rounded-lg p-2 text-stone-500 transition hover:bg-stone-100"
            aria-label="Copiar link individual"
            title="Copiar link individual"
          >
            {copiedToken === guest.inviteToken ? (
              <LinkIcon className="h-4 w-4 text-emerald-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
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
            onClick={() => onRequestDelete(guest)}
            className="rounded-lg p-2 text-rose-500 transition hover:bg-rose-50"
            aria-label="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}
