'use client'
import { reserveGiftAction } from '@/app/(public)/_actions/gifts.actions'
import { useActionState } from 'react'

export function ReserveGiftForm({ giftId }: { giftId: string }) {
  const [state, action, pending] = useActionState(reserveGiftAction, {
    ok: false,
    error: '',
  } as any)

  if (state.ok) {
    return (
      <p className="rounded bg-emerald-50 p-4 text-emerald-800">
        Presente reservado com sucesso! 💝
      </p>
    )
  }
  return (
    <form action={action} className="mt-6 space-y-3">
      <input type="hidden" name="giftId" value={giftId} />
      <input name="name" required placeholder="Seu nome" className="input" />
      <input
        name="email"
        required
        type="email"
        placeholder="Seu e-mail"
        className="input"
      />
      {state.error && <p className="text-red-600">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? 'Reservando…' : 'Marcar como presenteado'}
      </button>
    </form>
  )
}
