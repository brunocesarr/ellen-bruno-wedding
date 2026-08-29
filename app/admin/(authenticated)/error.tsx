'use client'

import { buttonPrimary } from '@/src/lib/class-names'
import { cn } from '@/src/lib/utils'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

/**
 * Route-segment error boundary for the whole authenticated admin area.
 * Without this, an error thrown by a nested page (e.g. unwrapForPage()
 * surfacing a failed server action) has no boundary to catch it below the
 * layout's shell — on Netlify that can abort the response mid-stream and
 * show the browser's own "This page couldn't load" network error instead of
 * a readable message.
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin]', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h1 className="font-serif text-2xl text-stone-900">
        Algo deu errado ao carregar esta página
      </h1>

      <p className="max-w-md text-sm text-stone-500">
        {error.message || 'Erro inesperado.'}
      </p>

      {error.digest && (
        <p className="text-xs text-stone-400">Código: {error.digest}</p>
      )}

      <div className="mt-2 flex gap-3">
        <button onClick={() => reset()} className={cn(buttonPrimary, 'py-2.5')}>
          Tentar novamente
        </button>
        <Link
          href="/admin"
          className="rounded-full px-5 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100"
        >
          Voltar ao painel
        </Link>
      </div>
    </div>
  )
}
