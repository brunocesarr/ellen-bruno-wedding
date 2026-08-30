'use client'

import { createGiftCardPaymentAction } from '@/app/(public)/_actions/gifts.actions'
import { Field, FieldInput, FieldTextarea } from '@/components/ui/Field'
import { type FormEvent, useState, useTransition } from 'react'
import { AnimatedButton } from '../ui/AnimatedButton'

export function CardPaymentForm({
  giftId,
  amount,
}: {
  giftId: string
  /** Set for open_item / fund — the amount the guest chose above. */
  amount: string | null
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    startTransition(async () => {
      const result = await createGiftCardPaymentAction({
        giftId,
        name,
        email,
        message: message.trim() || undefined,
        amount: amount ?? undefined,
      })

      if (!result.ok) {
        setFieldErrors(result.issues?.fieldErrors ?? {})
        setError(result.issues ? null : result.error)
        return
      }

      window.location.href = result.data.checkoutUrl
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl bg-white p-6 shadow-sm md:p-8"
    >
      <Field
        label="Seu nome"
        htmlFor="card-name"
        required
        error={fieldErrors.name?.[0]}
      >
        <FieldInput
          id="card-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Como você se chama?"
        />
      </Field>

      <Field
        label="Seu e-mail"
        htmlFor="card-email"
        required
        error={fieldErrors.email?.[0]}
      >
        <FieldInput
          id="card-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seuemail@exemplo.com"
        />
      </Field>

      <Field
        label="Mensagem para os noivos"
        htmlFor="card-message"
        hint="Opcional — mas vai ficar guardada com muito carinho 🤍"
        error={fieldErrors.message?.[0]}
      >
        <FieldTextarea
          id="card-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Deixe um recado, votos de felicidade, uma lembrança especial…"
        />
      </Field>

      {error && (
        <p className="rounded border border-terracotta/30 bg-terracotta/5 p-3 text-sm text-terracotta-dark">
          {error}
        </p>
      )}

      {fieldErrors.amount?.[0] && (
        <p className="rounded border border-terracotta/30 bg-terracotta/5 p-3 text-sm text-terracotta-dark">
          {fieldErrors.amount[0]}
        </p>
      )}

      <AnimatedButton pending={pending} pendingLabel="Redirecionando…">
        Pagar com cartão 💳
      </AnimatedButton>

      <p className="text-center text-xs text-ink-muted">
        Você será redirecionado ao Mercado Pago para concluir o pagamento com
        segurança 🔒
      </p>
    </form>
  )
}
