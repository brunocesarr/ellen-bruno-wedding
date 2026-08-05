'use client'

import {
  createInviteLinkAction,
  revokeInviteLinksAction,
} from '@/app/admin/_actions/invite-links.actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import type { InviteLink } from '@/src/entities/models/invite-link'
import { Check, Copy, Eye, Link2, RefreshCw, ShieldOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = {
  link: InviteLink | null
  siteUrl: string
}

type DialogKind = 'create' | 'rotate' | 'revoke'

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)

export function ShareableInviteLinkCard({ link, siteUrl }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [dialog, setDialog] = useState<DialogKind | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const url = link ? `${siteUrl}/invite/full?token=${link.token}` : null

  const copy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Não conseguimos copiar automaticamente. Copie manualmente.')
    }
  }

  const confirm = () => {
    if (!dialog) return
    setError(null)

    startTransition(async () => {
      const res =
        dialog === 'revoke'
          ? await revokeInviteLinksAction()
          : await createInviteLinkAction({})

      if (!res.ok) {
        setError(res.error)
        return
      }

      setDialog(null)
      router.refresh()
    })
  }

  const dialogProps = () => {
    if (dialog === 'create') {
      return {
        title: 'Gerar link compartilhável?',
        tone: 'primary' as const,
        confirmLabel: 'Gerar link',
        pendingLabel: 'Gerando...',
        description: (
          <>
            Criaremos um link único que dá acesso ao convite completo. Qualquer
            pessoa com o link poderá ver o convite e enviar uma solicitação de
            presença — que continuará precisando da sua aprovação.
          </>
        ),
      }
    }

    if (dialog === 'rotate') {
      return {
        title: 'Gerar um novo link?',
        tone: 'danger' as const,
        confirmLabel: 'Gerar novo link',
        pendingLabel: 'Gerando...',
        description: (
          <>
            O link atual deixará de funcionar imediatamente e um novo será
            criado. Use isso se o link foi compartilhado em algum lugar
            indesejado.
            <br />
            <br />
            Convites personalizados <strong>não</strong> são afetados.
          </>
        ),
      }
    }

    return {
      title: 'Desativar o link?',
      tone: 'danger' as const,
      confirmLabel: 'Desativar',
      pendingLabel: 'Desativando...',
      description: (
        <>
          O link deixará de dar acesso ao convite. Você pode gerar um novo
          depois.
          <br />
          <br />
          Convites personalizados <strong>não</strong> são afetados.
        </>
      ),
    }
  }

  const props = dialog ? dialogProps() : null

  return (
    <>
      <div className="rounded-2xl border border-stone-200/70 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-stone-900">
                Link compartilhável
              </h2>
              <p className="mt-1 max-w-xl text-sm text-stone-500">
                Um único link para grupos e redes sociais. Dá acesso ao convite
                completo, e quem responder entra nesta lista para sua aprovação.
              </p>
            </div>
          </div>

          {link && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-600">
              <Eye className="h-3.5 w-3.5" />
              {link.visitCount} {link.visitCount === 1 ? 'acesso' : 'acessos'}
            </span>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            {error}
          </p>
        )}

        {link && url ? (
          <div className="mt-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={url}
                aria-label="Link compartilhável do convite"
                onFocus={(e) => e.currentTarget.select()}
                className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 font-mono text-xs text-stone-700"
              />
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-stone-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-900"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-400">
              <span>Criado em {fmt(link.createdAt)}</span>
              {link.lastVisitedAt && (
                <span>Último acesso em {fmt(link.lastVisitedAt)}</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-stone-100 pt-4">
              <button
                type="button"
                onClick={() => setDialog('rotate')}
                className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Gerar novo link
              </button>
              <button
                type="button"
                onClick={() => setDialog('revoke')}
                className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <ShieldOff className="h-3.5 w-3.5" />
                Desativar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-lg border border-dashed border-stone-300 p-6 text-center">
            <p className="text-sm text-stone-500">
              Nenhum link ativo no momento.
            </p>
            <button
              type="button"
              onClick={() => setDialog('create')}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800"
            >
              <Link2 className="h-4 w-4" />
              Gerar link compartilhável
            </button>
          </div>
        )}
      </div>

      {props && (
        <ConfirmDialog
          open={dialog !== null}
          onOpenChange={(next) => {
            if (!next) {
              setDialog(null)
              setError(null)
            }
          }}
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
