'use client'
import { submitRsvpAction } from '@/app/(public)/_actions/rsvp.actions'
import { useActionState } from 'react'

const initial = { ok: false, error: '' } as any

export function RsvpForm() {
  const [state, action, pending] = useActionState(submitRsvpAction, initial)

  if (state.ok) {
    return (
      <div className="rounded-xl bg-emerald-50 p-6 text-emerald-800">
        Obrigado, <strong>{state.data.fullName}</strong>! Sua confirmação foi
        recebida 💕
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input
        name="fullName"
        required
        placeholder="Nome completo"
        className="input"
      />
      <input
        name="email"
        type="email"
        placeholder="E-mail (opcional)"
        className="input"
      />
      <input name="phone" placeholder="Telefone (opcional)" className="input" />

      <fieldset className="space-y-2">
        <legend className="font-medium">Você comparecerá?</legend>
        <label className="mr-4">
          <input type="radio" name="attending" value="true" required /> Sim
        </label>
        <label>
          <input type="radio" name="attending" value="false" /> Não poderei
        </label>
      </fieldset>

      <input
        name="companions"
        type="number"
        min={0}
        max={5}
        defaultValue={0}
        placeholder="Acompanhantes"
        className="input"
      />
      <textarea
        name="dietaryRestrictions"
        placeholder="Restrições alimentares"
        className="input"
      />
      <textarea
        name="message"
        placeholder="Mensagem para os noivos (opcional)"
        className="input"
      />

      {state.error && <p className="text-red-600">{state.error}</p>}
      <button disabled={pending} className="btn-primary">
        {pending ? 'Enviando…' : 'Confirmar presença'}
      </button>
    </form>
  )
}
