'use client'

import {
  submitRsvpAction,
  type RsvpActionState,
} from '@/app/(public)/_actions/rsvp.actions'
import {
  Field,
  FieldInput,
  FieldSelect,
  FieldTextarea,
} from '@/components/ui/Field'
import { useActionState } from 'react'
import { AnimatedButton } from '../ui/AnimatedButton'

const initialState: RsvpActionState = { ok: false, error: '' }

export function RsvpForm() {
  const [state, action, pending] = useActionState(
    submitRsvpAction,
    initialState
  )

  if (state.ok) {
    return (
      <div className="mx-auto max-w-xl rounded-sm border border-sage/40 bg-sage/5 p-10 text-center">
        <p className="eyebrow text-sage">Confirmação recebida</p>
        <h3 className="mt-3 font-display text-3xl text-terracotta">
          Obrigado, {state.data.fullName.split(' ')[0]}! 💕
        </h3>
        <p className="mt-3 text-ink-muted">
          Recebemos sua confirmação. Mal podemos esperar para celebrar com você.
        </p>
      </div>
    )
  }

  const fieldError = (key: string): string | undefined =>
    state.ok ? undefined : state.issues?.fieldErrors?.[key]?.[0]

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
            required
            autoComplete="name"
          />
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

        <Field
          label="Você comparecerá?"
          htmlFor="attending"
          required
          error={fieldError('attending')}
        >
          <FieldSelect id="attending" name="attending" defaultValue="" required>
            <option value="" disabled>
              Selecione uma opção
            </option>
            <option value="true">Sim, estarei presente 💕</option>
            <option value="false">Infelizmente não poderei</option>
          </FieldSelect>
        </Field>

        <Field
          label="Acompanhantes"
          htmlFor="companions"
          hint="Inclua adultos e crianças. Você não conta."
          error={fieldError('companions')}
        >
          <FieldSelect id="companions" name="companions" defaultValue="0">
            <option value="0">Nenhum (somente eu)</option>
            <option value="1">1 acompanhante</option>
            <option value="2">2 acompanhantes</option>
            <option value="3">3 acompanhantes</option>
            <option value="4">4 acompanhantes</option>
            <option value="5">5 acompanhantes</option>
          </FieldSelect>
        </Field>

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

      {!state.ok && state.error && !state.issues && (
        <p className="mt-6 rounded-sm border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta-dark">
          {state.error}
        </p>
      )}
    </form>
  )
}
