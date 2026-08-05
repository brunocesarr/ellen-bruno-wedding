'use client'

import {
  decideRsvpRequestAction,
  deleteRsvpRequestAction,
  resendRsvpDecisionEmailAction,
} from '@/app/admin/_actions/rsvp-requests.actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { RsvpRequest } from '@/src/entities/models/rsvp-request'
import {
  AlertTriangle,
  Check,
  Mail,
  MailWarning,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = { requests: RsvpRequest[] }

type DialogKind = 'approved' | 'rejected' | 'delete' | 'resend'
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

const needsNotification = (r: RsvpRequest) =>
  r.status !== 'pending' && r.notifiedAt === null

export function RsvpRequestsTable({ requests }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [dialog, setDialog] = useState<DialogState>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

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
    setWarning(null)

    startTransition(async () => {
      if (kind === 'delete') {
        const res = await deleteRsvpRequestAction({ id: request.id })
        if (!res.ok) return setError(res.error)
        closeDialog()
        return router.refresh()
      }

      if (kind === 'resend') {
        const res = await resendRsvpDecisionEmailAction({ id: request.id })
        if (!res.ok) return setError(res.error)
        closeDialog()
        return router.refresh()
      }

      const res = await decideRsvpRequestAction({
        id: request.id,
        decision: kind,
      })
      if (!res.ok) return setError(res.error)

      // The decision is committed either way. A failed e-mail is a warning
      // shown above the table, with a "Reenviar aviso" button on the row.
      if (!res.data.emailSent) {
        setWarning(
          `A decisão sobre ${request.fullName} foi salva, mas o e-mail não foi enviado` +
            `${res.data.emailError ? ` (${res.data.emailError})` : ''}. ` +
            'Use "Reenviar aviso" na linha correspondente.'
        )
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
        confirmLabel: 'Aprovar',
        pendingLabel: 'Aprovando...',
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
            Em seguida enviaremos um aviso para{' '}
            <strong className="text-stone-800">{request.email}</strong>. Se o
            e-mail falhar, a aprovação é mantida e você poderá reenviar o aviso.
          </>
        ),
      }
    }

    if (kind === 'rejected') {
      return {
        title: 'Recusar solicitação?',
        tone: 'danger' as const,
        confirmLabel: 'Recusar',
        pendingLabel: 'Recusando...',
        description: (
          <>
            <strong className="text-stone-800">{name}</strong> não será
            adicionada à lista de convidados.
            <br />
            <br />
            Em seguida enviaremos um e-mail gentil para{' '}
            <strong className="text-stone-800">{request.email}</strong>. Se o
            envio falhar, a recusa é mantida e você poderá reenviar o aviso.
          </>
        ),
      }
    }

    if (kind === 'resend') {
      return {
        title: 'Reenviar aviso?',
        tone: 'primary' as const,
        confirmLabel: 'Reenviar agora',
        pendingLabel: 'Enviando...',
        description: (
          <>
            Vamos tentar enviar novamente o aviso de{' '}
            <strong className="text-stone-800">
              {request.status === 'approved' ? 'aprovação' : 'recusa'}
            </strong>{' '}
            para <strong className="text-stone-800">{request.email}</strong>.
            {request.notifyError && (
              <>
                <br />
                <br />
                <span className="text-stone-500">
                  Última falha: {request.notifyError}
                </span>
              </>
            )}
          </>
        ),
      }
    }

    return {
      title: 'Excluir solicitação?',
      tone: 'danger' as const,
      confirmLabel: 'Excluir',
      pendingLabel: 'Excluindo...',
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
        {warning && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{warning}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <p className="py-10 text-center text-sm text-stone-500">
            Nenhuma solicitação por aqui ainda.
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
                  <th className="py-3 pr-4 font-medium">Aviso</th>
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
                    <td className="py-4 pr-4">
                      {r.status === 'pending' ? (
                        <span className="text-stone-300">—</span>
                      ) : r.notifiedAt ? (
                        <span
                          title={`Enviado em ${fmt(r.notifiedAt)}`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Avisado
                        </span>
                      ) : (
                        <span
                          title={r.notifyError ?? 'Aviso não enviado'}
                          className="inline-flex items-center gap-1 text-xs font-medium text-rose-600"
                        >
                          <MailWarning className="h-3.5 w-3.5" />
                          Falhou
                          {r.notifyAttempts > 1 && ` (${r.notifyAttempts}x)`}
                        </span>
                      )}
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
                      ) : needsNotification(r) ? (
                        <button
                          type="button"
                          onClick={() => openDialog('resend', r)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-amber-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-800"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Reenviar aviso
                        </button>
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
