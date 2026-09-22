'use client'

import {
  createGuestManagerLinkAction,
  revokeAllGuestManagerLinksAction,
  revokeGuestManagerLinkAction,
} from '@/app/admin/_actions/guest-manager-links.actions'
import { BusyOverlay } from '@/components/ui/BusyOverlay'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import type { GuestManagerLink } from '@/src/entities/models/guest-manager-link'
import { EXPIRY_CHOICES_IN_DAYS } from '@/src/entities/models/guest-manager-link'
import { cn } from '@/src/lib/utils'
import { Check, Copy, KeyRound, ShieldOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type Props = {
  links: GuestManagerLink[]
  siteUrl: string
}

type Dialog =
  | { kind: 'create' }
  | { kind: 'revoke'; link: GuestManagerLink }
  | { kind: 'revokeAll' }

const fmt = (d: Date) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)

const isExpired = (link: GuestManagerLink) =>
  link.expiresAt !== null && link.expiresAt.getTime() <= Date.now()

export function GuestManagerLinksCard({ links, siteUrl }: Props) {
  const router = useRouter()
  const { isCopied, copy } = useCopyToClipboard()

  const [label, setLabel] = useState('')
  const [expiresInDays, setExpiresInDays] = useState<string>('')
  const [creating, startCreate] = useTransition()
  const [revoking, startRevoke] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [dialog, setDialog] = useState<Dialog | null>(null)

  const active = links.filter((l) => l.isActive && !isExpired(l))

  const confirmCreate = () => {
    setError(null)
    startCreate(async () => {
      const res = await createGuestManagerLinkAction({
        label: label.trim() || undefined,
        expiresInDays: expiresInDays ? Number(expiresInDays) : undefined,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      setLabel('')
      setDialog(null)
      router.refresh()
    })
  }

  const confirmRevoke = () => {
    // 'create' is handled by confirmCreate; narrowing here keeps both paths
    // reading from the same dialog state without a cast.
    if (!dialog || dialog.kind === 'create') return
    setError(null)
    startRevoke(async () => {
      const res =
        dialog.kind === 'revokeAll'
          ? await revokeAllGuestManagerLinksAction()
          : await revokeGuestManagerLinkAction(dialog.link.id)

      if (!res.ok) {
        setError(res.error)
        return
      }
      setDialog(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-2xl border border-stone-200/70 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl text-stone-900">
                Acesso à lista sem login
              </h2>
              <p className="mt-1 max-w-xl text-sm text-stone-500">
                Um link por pessoa, para quem vai ajudar a manter a lista em
                dia. Quem recebe pode corrigir nomes e mudar status —{' '}
                <strong className="text-stone-700">
                  não pode adicionar nem excluir convidados
                </strong>
                , e não enxerga os links de convite individuais.
              </p>
            </div>
          </div>

          {active.length > 1 && (
            <button
              type="button"
              onClick={() => setDialog({ kind: 'revokeAll' })}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
            >
              <ShieldOff className="h-3.5 w-3.5" />
              Desativar todos
            </button>
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

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={120}
            placeholder="Para quem é este acesso? Ex.: Tia Maria"
            aria-label="Rótulo do acesso"
            className="min-w-0 flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          />
          <select
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(e.target.value)}
            aria-label="Prazo de validade"
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
          >
            <option value="">Sem expiração</option>
            {EXPIRY_CHOICES_IN_DAYS.map((days) => (
              <option key={days} value={days}>
                Expira em {days} dias
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setDialog({ kind: 'create' })}
            disabled={creating}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-800 disabled:opacity-60"
          >
            <KeyRound className="h-4 w-4" />
            {creating ? 'Gerando...' : 'Gerar acesso'}
          </button>
        </div>

        {links.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
            Nenhum acesso criado ainda.
          </p>
        ) : (
          <ul className="mt-5 divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200">
            {links.map((link) => {
              const url = `${siteUrl}/lista?token=${link.token}`
              const expired = isExpired(link)
              const usable = link.isActive && !expired

              return (
                <li
                  key={link.id}
                  className={cn('p-4', !usable && 'bg-stone-50/70')}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-800">
                        {link.label}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-400">
                        Criado em {fmt(link.createdAt)}
                        {link.lastUsedAt
                          ? ` · Último acesso em ${fmt(link.lastUsedAt)}`
                          : ' · Nunca acessado'}
                        {link.expiresAt &&
                          ` · Expira em ${fmt(link.expiresAt)}`}
                      </p>
                    </div>

                    {usable ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copy(url, link.id)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                        >
                          {isCopied(link.id) ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          {isCopied(link.id) ? 'Copiado!' : 'Copiar link'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDialog({ kind: 'revoke', link })}
                          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <ShieldOff className="h-3.5 w-3.5" />
                          Desativar
                        </button>
                      </div>
                    ) : (
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
                        {expired && link.isActive ? 'Expirado' : 'Desativado'}
                      </span>
                    )}
                  </div>

                  {usable && (
                    <input
                      readOnly
                      value={url}
                      aria-label={`Link de acesso de ${link.label}`}
                      onFocus={(e) => e.currentTarget.select()}
                      className="mt-3 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 font-mono text-xs text-stone-600"
                    />
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {dialog && (
        <ConfirmDialog
          open
          onOpenChange={(next) => {
            if (next) return
            setDialog(null)
            setError(null)
          }}
          {...dialogProps(dialog)}
          pending={creating || revoking}
          error={error}
          onConfirm={dialog.kind === 'create' ? confirmCreate : confirmRevoke}
        />
      )}

      <BusyOverlay
        show={creating || revoking}
        message={creating ? 'Gerando acesso...' : 'Desativando acesso...'}
      />
    </>
  )
}

/** Copy for each confirmation, kept out of the render body. */
function dialogProps(dialog: Dialog) {
  if (dialog.kind === 'create') {
    return {
      title: 'Gerar este acesso?',
      tone: 'primary' as const,
      confirmLabel: 'Gerar acesso',
      pendingLabel: 'Gerando...',
      description: (
        <>
          Criaremos um link que abre a lista de convidados{' '}
          <strong>sem pedir login</strong>. Quem tiver o link poderá corrigir
          nomes e mudar status — nada além disso — e você pode desativá-lo a
          qualquer momento.
        </>
      ),
    }
  }

  if (dialog.kind === 'revokeAll') {
    return {
      title: 'Desativar todos os acessos?',
      tone: 'danger' as const,
      confirmLabel: 'Desativar',
      pendingLabel: 'Desativando...',
      description: (
        <>
          Todos os links de acesso à lista deixarão de funcionar imediatamente.
          Convites dos convidados <strong>não</strong> são afetados.
        </>
      ),
    }
  }

  return {
    title: `Desativar o acesso de ${dialog.link.label}?`,
    tone: 'danger' as const,
    confirmLabel: 'Desativar',
    pendingLabel: 'Desativando...',
    description: (
      <>
        O link deixará de funcionar imediatamente. As alterações já feitas por
        essa pessoa permanecem na lista.
      </>
    ),
  }
}
