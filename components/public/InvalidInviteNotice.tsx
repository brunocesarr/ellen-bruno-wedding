'use client'

import {
  INVALID_INVITE_PARAM,
  INVALID_INVITE_VALUE,
} from '@/src/lib/invite-redirect'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useSyncExternalStore } from 'react'

/**
 * Fired after we rewrite the URL. A synthetic `popstate` would work too, but
 * Next's router also listens to it and would treat this as a navigation.
 */
const NOTICE_CHANGED = 'invite-notice:change'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NOTICE_CHANGED, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NOTICE_CHANGED, onChange)
  }
}

/** Returns a primitive, so referential stability is not a concern. */
function getSnapshot(): boolean {
  return (
    new URLSearchParams(window.location.search).get(INVALID_INVITE_PARAM) ===
    INVALID_INVITE_VALUE
  )
}

/** No `window` during prerender — and no hydration mismatch, by design. */
function getServerSnapshot(): boolean {
  return false
}

/**
 * Explains why a guest with a dead invite link landed on the homepage.
 *
 * Visibility is derived directly from the query string rather than mirrored
 * into state, so there is no setState-in-effect and no cascading render. The
 * only effect here subscribes a timer to an external system, which is what
 * effects are for.
 *
 * Rendered unconditionally by the landing page: it self-gates on the param, so
 * the page needs no `searchParams` and stays statically cacheable.
 */
export function InvalidInviteNotice() {
  const flagged = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  // Hiding and cleaning the URL are the same action: strip the param, notify,
  // and the derived `flagged` flips to false on the next render.
  const dismiss = useCallback(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has(INVALID_INVITE_PARAM)) return

    params.delete(INVALID_INVITE_PARAM)
    const query = params.toString()

    // replaceState (not pushState) so the dead-token URL is not left behind as
    // a history entry the Back button can bounce through.
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}`
    )
    window.dispatchEvent(new Event(NOTICE_CHANGED))
  }, [])

  useEffect(() => {
    if (!flagged) return
    const timer = window.setTimeout(dismiss, 12_000)
    return () => window.clearTimeout(timer)
  }, [flagged, dismiss])

  return (
    <AnimatePresence>
      {flagged && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
        >
          <div className="pointer-events-auto w-full max-w-md rounded-xl border border-amber-200 bg-white/95 p-4 shadow-lg backdrop-blur">
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-50 text-lg"
              >
                &#128140;
              </span>

              <div className="min-w-0 flex-1">
                <p className="font-serif text-sm font-medium text-stone-900">
                  Este link de convite não está mais válido
                </p>
                <p className="mt-1 text-xs leading-relaxed text-stone-600">
                  Pode ter expirado ou sido substituído. Fale com os noivos para
                  receber um novo — ou{' '}
                  <a
                    href="/rsvp"
                    className="font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900"
                  >
                    envie sua solicitação por aqui
                  </a>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={dismiss}
                aria-label="Fechar aviso"
                className="-mr-1 -mt-1 shrink-0 rounded-md p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden
                >
                  <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
