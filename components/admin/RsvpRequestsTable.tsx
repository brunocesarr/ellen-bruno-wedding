'use client'

import {
  decideRsvpRequestAction,
  deleteRsvpRequestAction,
} from '@/app/admin/_actions/rsvp-requests.actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'
import { Check, Mail, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = { requests: RsvpRequest[] }

type DialogKind = 'approved' | 'rejected' | 'delete'
type DialogState = { kind: DialogKind; request: RsvpRequest } | null

const STATUS_STYLES: Record<RsvpRequest['status'], string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-stone-100 text-stone-600 ring-stone-200',
}

const STATUS_LABELS: Record<RsvpRequest['status'], string> = {
  pending: 'Aguardando',
  approved: 'Aprovada',
  rejected: 'Recusada',
}

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)

export function RsvpRequestsTable({ requests }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [error, setError] = useState<string | null>(null)

  const openDialog = (kind: DialogKind, request: RsvpRequest) => {
    setError(null)
    setDialog({ kind, request })
  }

  const closeDialog = () => {
    setDialog(null)
    setError(null)
  }

  const confirm = () => {
    if (!dialog) return
    const { kind, request } = dialog
    setError(null)

    startTransition(async () => {
      const res =
        kind === 'delete'
          ? await deleteRsvpRequestAction({ id: request.id })
          : await decideRsvpRequestAction({ id: request.id, decision: kind })

      if (!res.ok) {
        // Keep the dialog open so the admin can read the reason and retry.
        setError(res.error)
        return
      }

      closeDialog()
      router.refresh()
    })
  }

  const dialogProps = () => {
    if (!dialog) return null
    const { kind, request } = dialog
    const name = request.fullName

    if (kind === 'approved') {
      return {
        title: 'Aprovar solicitação?',
        tone: 'primary' as const,
        confirmLabel: 'Aprovar e enviar e-mail',
        pendingLabel: 'Enviando e-mail…',
        description: (
          <>
            <strong className="text-stone-800">{name}</strong> será adicionada à
            lista de convidados como{' '}
            <strong className="text-stone-800">
              {request.attending ? 'confirmada' : 'ausente'}
            </strong>
            .
            <br />
            <br />
            Enviaremos primeiro um e-mail para{' '}
            <strong className="text-stone-800">{request.email}</strong>. A
            aprovação só será aplicada se o e-mail for entregue.
          </>
        ),
      }
    }

    if (kind === 'rejected') {
      return {
        title: 'Recusar solicitação?',
        tone: 'danger' as const,
        confirmLabel: 'Recusar e enviar e-mail',
        pendingLabel: 'Enviando e-mail…',
        description: (
          <>
            <strong className="text-stone-800">{name}</strong> não será
            adicionada à lista de convidados.
            <br />
            <br />
            Enviaremos um e-mail gentil para{' '}
            <strong className="text-stone-800">{request.email}</strong>. A
            recusa só será aplicada se o e-mail for entregue.
          </>
        ),
      }
    }

    return {
      title: 'Excluir solicitação?',
      tone: 'danger' as const,
      confirmLabel: 'Excluir',
      pendingLabel: 'Excluindo…',
      description: (
        <>
          A solicitação de <strong className="text-stone-800">{name}</strong>{' '}
          será removida permanentemente.
          <br />
          <br />
          Nenhum e-mail será enviado e a pessoa poderá se cadastrar novamente
          depois. Esta ação não pode ser desfeita.
        </>
      ),
    }
  }

  const props = dialogProps()

  return (
    <>
      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="py-10 text-center text-sm text-stone-500">
            Nenhuma solicitação por aqui ainda 🤍
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500">
                  <th className="py-3 pr-4 font-medium">Nome</th>
                  <th className="py-3 pr-4 font-medium">Contato</th>
                  <th className="py-3 pr-4 font-medium">Comparecerá</th>
                  <th className="py-3 pr-4 font-medium">Mensagem</th>
                  <th className="py-3 pr-4 font-medium">Recebida</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {requests.map((r) => (
                  <tr key={r.id} className="align-top">
                    <td className="py-4 pr-4 font-medium text-stone-900">
                      {r.fullName}
                    </td>
                    <td className="py-4 pr-4">
                      <a
                        href={`mailto:${r.email}`}
                        className="inline-flex items-center gap-1.5 text-stone-600 underline-offset-2 hover:text-stone-900 hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        {r.email}
                      </a>
                    </td>
                    <td className="py-4 pr-4">
                      {r.attending ? (
                        <span className="text-emerald-700">Sim</span>
                      ) : (
                        <span className="text-stone-500">Não</span>
                      )}
                    </td>
                    <td className="max-w-xs py-4 pr-4 text-stone-600">
                      {r.message ? (
                        <span className="line-clamp-3">{r.message}</span>
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-4 pr-4 text-stone-500">
                      {fmt(r.createdAt)}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[r.status]}`}
                      >
                        {STATUS_LABELS[r.status]}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      {r.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDialog('approved', r)}
                            className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Aprovar
                          </button>
                          <button
                            type="button"
                            onClick={() => openDialog('rejected', r)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Recusar
                          </button>
                          <button
                            type="button"
                            onClick={() => openDialog('delete', r)}
                            aria-label={`Excluir solicitação de ${r.fullName}`}
                            title="Excluir solicitação"
                            className="inline-flex items-center rounded-md p-1.5 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400">
                          {r.decidedAt ? fmt(r.decidedAt) : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {props && (
        <ConfirmDialog
          open={dialog !== null}
          onOpenChange={(next) => !next && closeDialog()}
          title={props.title}
          description={props.description}
          confirmLabel={props.confirmLabel}
          pendingLabel={props.pendingLabel}
          tone={props.tone}
          pending={pending}
          error={error}
          onConfirm={confirm}
        />
      )}
    </>
  )
}
