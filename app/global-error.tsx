'use client'

import { useEffect } from 'react'

/**
 * Last-resort boundary: catches throws from the ROOT layout (app/layout.tsx),
 * which no segment-level error.tsx can reach. Replaces the whole document when
 * active, so it must render its own <html>/<body>.
 *
 * Styles are inline on purpose — global-error renders its own document and does
 * NOT include globals.css, so Tailwind classes would not apply here.
 */
export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string }
  retry?: () => void
  reset?: () => void
}) {
  useEffect(() => {
    console.error('[global]', error)
  }, [error])

  const recover = retry ?? reset

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '1.5rem',
          textAlign: 'center',
          background: '#fafaf9',
          color: '#1c1917',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <title>Erro • Ellen &amp; Bruno</title>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
          Algo deu errado
        </h1>

        <p
          style={{ maxWidth: '28rem', color: '#78716c', fontSize: '0.875rem' }}
        >
          Não conseguimos carregar esta página. Tente novamente em alguns
          instantes.
        </p>

        {error.digest && (
          <p
            style={{
              fontFamily: 'ui-monospace, monospace',
              fontSize: '0.75rem',
              color: '#a8a29e',
            }}
          >
            Código: {error.digest}
          </p>
        )}

        {recover && (
          <button
            onClick={() => recover()}
            style={{
              marginTop: '0.5rem',
              cursor: 'pointer',
              borderRadius: '9999px',
              border: 'none',
              background: '#b45309',
              color: '#fff',
              padding: '0.625rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
            }}
          >
            Tentar novamente
          </button>
        )}
      </body>
    </html>
  )
}
