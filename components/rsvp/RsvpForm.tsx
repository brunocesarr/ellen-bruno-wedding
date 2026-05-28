'use client'

import { confirmAttendanceAction } from '@/app/(public)/_actions/guests.actions'
import {
  Field,
  FieldInput,
  FieldSelect,
  FieldTextarea,
} from '@/components/ui/Field'
import { Guest } from '@/src/entities/models/guest'
import { useActionState } from 'react'
import { AnimatedButton } from '../ui/AnimatedButton'

type ConfirmActionState = Awaited<
  ReturnType<typeof confirmAttendanceAction>
> | null

type Props = {
  invite: { guest: Guest; partyMembers: Guest[] }
}

export function RsvpForm({ invite }: Props) {
  const isTokenized = !!invite

  const [state, action, pending] = useActionState<ConfirmActionState, FormData>(
    async (_prev, formData) => {
      const ownerStatus = formData.get('owner-status') as 'going' | 'not_going'

      const attendees: { guestId: string; status: 'going' | 'not_going' }[] = [
        { guestId: invite.guest.id, status: ownerStatus },
        ...invite.partyMembers
          .filter((m) => formData.get(`companion-${m.id}`) === 'on')
          .map((m) => ({ guestId: m.id, status: 'going' as const })),
      ]

      const message = (formData.get('message') as string | null) ?? undefined

      return confirmAttendanceAction({
        inviteToken: invite.guest.inviteToken,
        attendees,
        message,
      })
    },
    null
  )

  const fullName = isTokenized
    ? `${invite!.guest.firstName} ${invite!.guest.lastName}`
    : ''

  if (state && state.ok) {
    return (
      <div className="mx-auto max-w-xl rounded-sm border border-sage/40 bg-sage/5 p-10 text-center">
        <p className="eyebrow text-sage">Confirmação recebida</p>
        <h3 className="mt-3 font-display text-3xl text-terracotta">
          Obrigado, {invite?.guest.firstName}! 💕
        </h3>
        <p className="mt-3 text-ink-muted">
          Recebemos sua confirmação. Mal podemos esperar para celebrar com você.
        </p>
      </div>
    )
  }

  const fieldError = (path: string): string | undefined => {
    if (!state || state.ok) return undefined
    const issues = state.issues
    if (!Array.isArray(issues)) return undefined

    const match = issues.find(
      (i): i is { path: (string | number)[]; message: string } =>
        typeof i === 'object' &&
        i !== null &&
        Array.isArray((i as { path?: unknown }).path) &&
        typeof (i as { message?: unknown }).message === 'string'
    )

    return match?.path.join('.') === path ? match.message : undefined
  }

  return (
    <form action={action} className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2">
        <Field
          label="Seu nome"
          htmlFor="fullName"
          required
          error={fieldError('fullName')}
        >
          <FieldInput
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Como podemos te chamar?"
            autoComplete="name"
            defaultValue={fullName}
            readOnly={isTokenized}
            disabled={isTokenized}
            required={!isTokenized}
            aria-readonly={isTokenized}
            className={isTokenized ? 'cursor-not-allowed' : ''}
          />
        </Field>

        <Field
          label="Você comparecerá?"
          htmlFor="attending"
          required
          error={fieldError('attending')}
        >
          <FieldSelect
            id="attending"
            name="owner-status"
            defaultValue=""
            required
          >
            <option value="" disabled>
              Selecione uma opção
            </option>
            <option value="going">Sim, estarei presente 💕</option>
            <option value="not_going">Infelizmente não poderei</option>
          </FieldSelect>
        </Field>

        <Field label="Seu e-mail" htmlFor="email" error={fieldError('email')}>
          <FieldInput
            id="email"
            name="email"
            type="email"
            placeholder="email@exemplo.com"
            autoComplete="email"
          />
        </Field>

        {invite!.partyMembers.length > 0 && (
          <div className="md:col-span-2">
            <Field
              label="Confirmar acompanhantes?"
              htmlFor="companion"
              error={fieldError('attending')}
            >
              {invite!.partyMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-start gap-4"
                >
                  <FieldInput
                    type="checkbox"
                    name={`companion-${m.id}`}
                    defaultChecked={m.status === 'going'}
                    className="w-[16px] h-[16px] text-terracotta focus:ring-terracotta/50"
                  />
                  <span>
                    {m.firstName} {m.lastName}
                  </span>
                </div>
              ))}
            </Field>
          </div>
        )}

        <div className="md:col-span-2">
          <Field
            label="Mensagem para os noivos"
            htmlFor="message"
            hint="Opcional — mas adoraríamos ler ✨"
            error={fieldError('message')}
          >
            <FieldTextarea
              id="message"
              name="message"
              rows={4}
              placeholder="Compartilhe um carinho, sua expectativa, ou alguma observação importante…"
              maxLength={1000}
            />
          </Field>
        </div>
      </div>

      <div className="mt-12 flex flex-col-reverse items-start justify-between gap-6 border-t border-ink/10 pt-8 md:flex-row md:items-center">
        <p className="max-w-md text-xs leading-relaxed text-ink-muted">
          Seus dados serão usados apenas para a organização do nosso casamento.
          Não compartilhamos com terceiros 🤍
        </p>

        <AnimatedButton pending={pending} pendingLabel="Reservando…">
          Confirmar presença
        </AnimatedButton>
      </div>

      {state && !state.ok && state.error && !state.issues && (
        <p className="mt-6 rounded-sm border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta-dark">
          {state.error}
        </p>
      )}
    </form>
  )
}
