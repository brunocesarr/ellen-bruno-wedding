'use client'

import { submitRsvpRequestAction } from '@/app/(public)/_actions/rsvp-requests.actions'
import {
  Field,
  FieldInput,
  FieldSelect,
  FieldTextarea,
} from '@/components/ui/Field'
import { useActionState } from 'react'
import { AnimatedButton } from '../ui/AnimatedButton'

type SubmitActionState = Awaited<
  ReturnType<typeof submitRsvpRequestAction>
> | null

export function RsvpRequestForm() {
  const [state, action, pending] = useActionState<SubmitActionState, FormData>(
    async (_prev, formData) =>
      submitRsvpRequestAction({
        fullName: (formData.get('fullName') as string | null) ?? '',
        email: (formData.get('email') as string | null) ?? '',
        attending: formData.get('attending') === 'going',
        message: (formData.get('message') as string | null) ?? undefined,
      }),
    null
  )

  if (state?.ok) {
    return (
      <div className="mx-auto max-w-xl rounded-sm border border-sage/40 bg-sage/5 p-10 text-center">
        <p className="eyebrow text-sage">Solicitação recebida</p>
        <h3 className="mt-3 font-display text-3xl text-terracotta">
          Obrigado, {state.data.fullName.split(' ')[0]}! 💕
        </h3>
        <p className="mt-3 text-ink-muted">
          Recebemos seus dados com todo o carinho. Vamos conferir nossa lista e
          entraremos em contato pelo e-mail{' '}
          <strong className="text-ink">{state.data.email}</strong> o mais breve
          possível.
        </p>
      </div>
    )
  }

  const fieldError = (name: string): string | undefined => {
    if (!state || state.ok) return undefined
    return state.issues?.fieldErrors?.[name]?.[0]
  }

  const formError =
    state && !state.ok && !state.issues ? state.error : undefined

  return (
    <form action={action} className="mx-auto max-w-4xl">
      <p className="mx-auto mb-10 max-w-2xl text-center text-sm leading-relaxed text-ink-muted">
        Você chegou aqui sem um convite personalizado — sem problemas! Preencha
        seus dados abaixo e nós confirmaremos sua presença em seguida. Esta
        solicitação vale para <strong className="text-ink">uma pessoa</strong>.
      </p>

      <div className="grid grid-cols-1 gap-x-12 gap-y-7 md:grid-cols-2">
        <Field
          label="Seu nome completo"
          htmlFor="fullName"
          required
          hint="Nome e sobrenome, por favor"
          error={fieldError('fullName')}
        >
          <FieldInput
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Ex.: Maria Souza"
            autoComplete="name"
            maxLength={120}
            required
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
            <option value="going">Sim, estarei presente 💕</option>
            <option value="not_going">Infelizmente não poderei</option>
          </FieldSelect>
        </Field>

        <div className="md:col-span-2">
          <Field
            label="Seu e-mail"
            htmlFor="email"
            required
            hint="É por aqui que enviaremos nossa resposta"
            error={fieldError('email')}
          >
            <FieldInput
              id="email"
              name="email"
              type="email"
              placeholder="email@exemplo.com"
              autoComplete="email"
              required
            />
          </Field>
        </div>

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
              placeholder="Conte para nós como você conhece o casal, ou deixe um carinho…"
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

        <AnimatedButton pending={pending} pendingLabel="Enviando…">
          Enviar solicitação
        </AnimatedButton>
      </div>

      {formError && (
        <p className="mt-6 rounded-sm border border-terracotta/30 bg-terracotta/5 p-4 text-sm text-terracotta-dark">
          {formError}
        </p>
      )}
    </form>
  )
}
