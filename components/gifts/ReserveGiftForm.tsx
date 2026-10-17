'use client'

import { reserveGiftAction } from '@/app/(public)/_actions/gifts.actions'
import { Field, FieldInput, FieldTextarea } from '@/components/ui/Field'
import { Honeypot } from '@/components/ui/Honeypot'
import type { ActionResult } from '@/src/lib/server-action-result'
import { motion } from 'motion/react'
import { useActionState, useRef } from 'react'
import { AnimatedButton } from '../ui/AnimatedButton'

const initial: ActionResult<{ id: string; name: string }> = {
  ok: false,
  error: '',
}

export function ReserveGiftForm({
  giftId,
  amount = null,
}: {
  giftId: string
  /** Set for open_item / fund — the exact figure the displayed QR was built from. */
  amount?: string | null
}) {
  // Minted on first submit (client-only, so a cached page can never hand every
  // visitor the same id) and reused for any resubmit of this form.
  const contributionId = useRef<string | null>(null)
  const [state, action, pending] = useActionState(
    (prev: typeof initial, formData: FormData) => {
      contributionId.current ??= crypto.randomUUID()
      formData.set('contributionId', contributionId.current)
      return reserveGiftAction(prev, formData)
    },
    initial
  )

  if (state.ok) {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-sage/10 p-8 text-center"
      >
        <p className="eyebrow text-sage">Sucesso</p>
        <h3 className="mt-3 font-display text-2xl text-terracotta">
          Obrigado, {state.data.name?.split(' ')[0] ?? 'do fundo do coração'}!
          💕
        </h3>
        <p className="mt-3 text-sm text-ink-muted">
          Seu carinho ficará marcado para sempre na nossa história.
        </p>
      </motion.div>
    )
  }

  const fieldError = (key: string) => state.issues?.fieldErrors?.[key]?.[0]

  return (
    <form
      action={action}
      className="relative space-y-6 rounded-3xl bg-white p-6 shadow-sm md:p-8"
    >
      <Honeypot />
      <input type="hidden" name="giftId" value={giftId} />

      {/* Omitted for fixed_item, where the gift's own price is used. */}
      {amount !== null && <input type="hidden" name="amount" value={amount} />}

      <Field
        label="Seu nome"
        htmlFor="name"
        required
        error={fieldError('name')}
      >
        <FieldInput
          id="name"
          name="name"
          type="text"
          required
          placeholder="Como você se chama?"
        />
      </Field>

      <Field
        label="Mensagem para os noivos"
        htmlFor="message"
        hint="Opcional — mas vai ficar guardada com muito carinho 🤍"
        error={fieldError('message')}
      >
        <FieldTextarea
          id="message"
          name="message"
          rows={4}
          maxLength={500}
          placeholder="Deixe um recado, votos de felicidade, uma lembrança especial…"
        />
      </Field>

      {state.error && !state.issues && (
        <p
          role="alert"
          className="rounded border border-terracotta/30 bg-terracotta/5 p-3 text-sm text-terracotta-dark"
        >
          {state.error}
        </p>
      )}

      {fieldError('amount') && (
        <p
          role="alert"
          className="rounded border border-terracotta/30 bg-terracotta/5 p-3 text-sm text-terracotta-dark"
        >
          {fieldError('amount')}
        </p>
      )}

      <AnimatedButton pending={pending} pendingLabel="Reservando…">
        Confirmar presente 💕
      </AnimatedButton>

      <p className="md:hidden block text-center text-xs text-ink-muted">
        Não se preocupe: o pagamento já é feito pelo Pix acima 👆
      </p>

      <p className="hidden md:block text-center text-xs text-ink-muted">
        Não se preocupe: o pagamento já é feito pelo Pix ao lado 👆
      </p>
    </form>
  )
}
