'use client'

import { buttonPrimary } from '@/src/lib/class-names'
import { cn } from '@/src/lib/utils'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'

/**
 * Boundary for the ADMIN SEGMENT — deliberately one level above
 * `(authenticated)/error.tsx`.
 *
 * Next.js: "error.js wraps loading.js, not-found.js, page.js, and nested
 * layout.js files... It does NOT wrap the layout.js of the same segment."
 * So `(authenticated)/error.tsx` cannot catch a throw from
 * `(authenticated)/layout.tsx`, which runs supabase.auth.getUser() plus the
 * RSVP-alerts query on every admin request. Uncaught there, the RSC stream is
 * severed mid-response and the browser shows its own network error page with
 * React error #412 ("Connection closed") in the console instead of any UI.
 * This file is that missing net.
 */
export default function AdminSegmentError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string }
  retry?: () => void
  reset?: () => void
}) {
  useEffect(() => {
    console.error('[admin segment]', error)
  }, [error])

  const recover = retry ?? reset

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-50 px-6 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-rose-50 text-rose-600">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h1 className="font-serif text-2xl text-stone-900">
        Não foi possível carregar o painel
      </h1>

      <p className="max-w-md text-sm text-stone-500">
        Ocorreu um erro ao preparar a área administrativa. Tente novamente em
        alguns instantes.
      </p>

      {/* In production Next.js replaces Server Component error messages with a
          generic string and exposes only this digest — it's the key for
          matching the real stack trace in the Netlify function logs. */}
      {error.digest && (
        <p className="font-mono text-xs text-stone-400">
          Código: {error.digest}
        </p>
      )}

      <div className="mt-2 flex gap-3">
        {recover && (
          <button
            onClick={() => recover()}
            className={cn(buttonPrimary, 'py-2.5')}
          >
            Tentar novamente
          </button>
        )}
        <Link
          href="/admin/login"
          className="rounded-full px-5 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100"
        >
          Ir para o login
        </Link>
      </div>
    </div>
  )
}
