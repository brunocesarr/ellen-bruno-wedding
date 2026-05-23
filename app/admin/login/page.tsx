'use client'
import { signInAction } from '@/app/admin/_actions/auth.actions'
import { useActionState } from 'react'

export default function LoginPage() {
  const [state, action, pending] = useActionState(signInAction, {
    ok: false,
    error: '',
  } as any)
  return (
    <main className="mx-auto grid min-h-screen max-w-sm place-items-center p-6">
      <form
        action={action}
        className="w-full space-y-4 rounded-xl border bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-serif">Painel · Login</h1>
        <input
          name="email"
          type="email"
          required
          placeholder="E-mail"
          className="input"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Senha"
          className="input"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className="btn-primary w-full">
          {pending ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
