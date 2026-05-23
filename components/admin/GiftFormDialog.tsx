'use client'
import { createGiftAction } from '@/app/admin/_actions/gifts.actions'
import { useActionState, useState } from 'react'

export function GiftFormDialog() {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createGiftAction, {
    ok: false,
    error: '',
  } as any)

  if (state.ok && open) setOpen(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Novo presente
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <form
            action={action}
            className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6"
          >
            <h2 className="text-xl font-semibold">Novo presente</h2>
            <input name="name" required placeholder="Nome" className="input" />
            <textarea
              name="description"
              placeholder="Descrição"
              className="input"
            />
            <input
              name="price"
              type="number"
              step="0.01"
              required
              placeholder="Preço"
              className="input"
            />
            <input
              name="image"
              type="file"
              accept="image/*"
              className="input"
            />
            {state.error && <p className="text-red-600">{state.error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button disabled={pending} className="btn-primary">
                {pending ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
