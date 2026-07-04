import { GuestFormDialog } from '@/components/admin/GuestFormDialog'
import type { Party, GuestListCallbacks } from '@/src/lib/guests'
import { Copy, Link as LinkIcon, UserPlus, Users } from 'lucide-react'
import { memo } from 'react'
import { GuestMobileCard } from './GuestMobileCard'
import { GuestRow } from './GuestRow'

type Props = { party: Party } & GuestListCallbacks

function PartyCardBase({
  party,
  copiedToken,
  onCopyInvite,
  onRequestDelete,
  onSaved,
}: Props) {
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
            onClick={() => onCopyInvite(head.partyInviteToken)}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50"
            title="Copiar link do grupo"
          >
            {copiedToken === head.partyInviteToken ? (
              <>
                <LinkIcon className="h-3.5 w-3.5 text-emerald-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Link do grupo
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
              copiedToken={copiedToken}
              onCopyInvite={onCopyInvite}
              onRequestDelete={onRequestDelete}
              onSaved={onSaved}
            />
            {companions.map((g) => (
              <GuestRow
                key={g.id}
                guest={g}
                copiedToken={copiedToken}
                onCopyInvite={onCopyInvite}
                onRequestDelete={onRequestDelete}
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
            copiedToken={copiedToken}
            onCopyInvite={onCopyInvite}
            onRequestDelete={onRequestDelete}
            onSaved={onSaved}
          />
        ))}
      </div>
    </article>
  )
}

export const PartyCard = memo(PartyCardBase)
