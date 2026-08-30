'use client'

import {
  confirmAttendanceAction,
  renameGuestNamesAction,
} from '@/app/(public)/_actions/guests.actions'
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

      const names = [invite.guest, ...invite.partyMembers]
        .map((g) => {
          const firstName = (
            formData.get(`name-${g.id}-firstName`) as string | null
          )?.trim()
          const lastName = (
            formData.get(`name-${g.id}-lastName`) as string | null
          )?.trim()
          if (!firstName || !lastName) return null
          if (firstName === g.firstName && lastName === g.lastName) return null
          return { guestId: g.id, firstName, lastName }
        })
        .filter(
          (n): n is { guestId: string; firstName: string; lastName: string } =>
            n !== null
        )

      if (names.length > 0) {
        const renameResult = await renameGuestNamesAction({
          inviteToken: invite.guest.inviteToken,
          names,
        })
        if (!renameResult.ok) return renameResult
      }

      return confirmAttendanceAction({
        inviteToken: invite.guest.inviteToken,
        attendees,
        message,
      })
    },
    null
  )

  if (state && state.ok) {
    return (
      <div className="mx-auto max-w-xl rounded-sm border border-sage/40 bg-sage/5 p-10 text-center">
        <p className="eyebrow text-sage">Confirmação recebida</p>
        <h3 className="mt-3 font-display text-3xl text-terracotta">
          Obrigado, {invite.guest.firstName}! 💕
        </h3>
        <p className="mt-3 text-ink-muted">
          Recebemos sua confirmação. Mal podemos esperar para celebrar com você.
        </p>
      </div>
    )
  }

  const fieldError = (name: string): string | undefined => {
    if (!state || state.ok) return undefined
    return state.issues?.fieldErrors?.[name]?.[0]
  }

  return (
    <form action={action} className="mx-auto max-w-4xl">
      <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2">
        <Field
          label="Seu primeiro nome"
          htmlFor="ownerFirstName"
          required
          hint="Viu um erro? Pode corrigir aqui."
          error={fieldError('firstName')}
        >
          <FieldInput
            id="ownerFirstName"
            name={`name-${invite.guest.id}-firstName`}
            type="text"
            autoComplete="given-name"
            defaultValue={invite.guest.firstName}
          />
        </Field>

        <Field
          label="Seu sobrenome"
          htmlFor="ownerLastName"
          required
          error={fieldError('lastName')}
        >
          <FieldInput
            id="ownerLastName"
            name={`name-${invite.guest.id}-lastName`}
            type="text"
            autoComplete="family-name"
            defaultValue={invite.guest.lastName}
          />
        </Field>

        <Field
          label="Você comparecerá?"
          htmlFor="attending"
          required
          error={fieldError('attendees')}
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

        {invite.partyMembers.length > 0 && (
          <div className="md:col-span-2">
            <Field
              label="Confirmar acompanhantes?"
              htmlFor="companion"
              hint="Viu um nome errado? Pode corrigir antes de confirmar."
              error={fieldError('attendees')}
            >
              <div className="flex flex-col gap-4">
                {invite.partyMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex flex-col gap-2 rounded-sm border border-ink/10 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <FieldInput
                        type="checkbox"
                        name={`companion-${m.id}`}
                        defaultChecked={m.status === 'going'}
                        className="h-[16px] w-[16px] text-terracotta focus:ring-terracotta/50"
                      />
                      <span className="text-sm text-ink-muted">
                        Confirmar presença
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <FieldInput
                        type="text"
                        name={`name-${m.id}-firstName`}
                        defaultValue={m.firstName}
                        placeholder="Primeiro nome"
                        aria-label={`Primeiro nome de ${m.firstName} ${m.lastName}`}
                      />
                      <FieldInput
                        type="text"
                        name={`name-${m.id}-lastName`}
                        defaultValue={m.lastName}
                        placeholder="Sobrenome"
                        aria-label={`Sobrenome de ${m.firstName} ${m.lastName}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
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

        <AnimatedButton pending={pending} pendingLabel="Confirmando…">
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
