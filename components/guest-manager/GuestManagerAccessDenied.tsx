import { ShieldOff } from 'lucide-react'

/**
 * Shown for a missing, revoked, expired or malformed token alike — the page
 * must not reveal which of those it was.
 */
export function GuestManagerAccessDenied() {
  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 px-4">
      <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <span
          aria-hidden
          className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600"
        >
          <ShieldOff className="h-5 w-5" />
        </span>

        <h1 className="mt-4 font-serif text-xl text-stone-900">
          Este link de acesso não está válido
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Ele pode ter sido desativado ou substituído. Fale com os noivos para
          receber um novo link.
        </p>
      </div>
    </main>
  )
}
