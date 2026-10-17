'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function PublicError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string }
  retry?: () => void
  reset?: () => void
}) {
  useEffect(() => {
    console.error('[public]', error)
  }, [error])

  const recover = retry ?? reset

  return (
    <div
      role="alert"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <h1 className="font-display text-3xl text-terracotta">Algo deu errado</h1>
      <p className="max-w-md text-ink-muted">
        Não conseguimos carregar esta página. Tente novamente em alguns
        instantes.
      </p>
      {error.digest && (
        <p className="text-xs text-ink-muted">Código: {error.digest}</p>
      )}
      <div className="mt-2 flex gap-3">
        {recover && (
          <button
            onClick={() => recover()}
            className="rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          >
            Tentar novamente
          </button>
        )}
        <Link
          href="/"
          className="rounded-full px-6 py-2.5 text-sm text-ink-muted transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
