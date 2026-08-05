'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'

type Tone = 'danger' | 'primary' | 'neutral'

const CONFIRM_STYLES: Record<Tone, string> = {
  danger: 'bg-rose-600 hover:bg-rose-700 focus-visible:outline-rose-600',
  primary:
    'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600',
  neutral: 'bg-stone-800 hover:bg-stone-900 focus-visible:outline-stone-800',
}

const ICON_STYLES: Record<Tone, string> = {
  danger: 'bg-rose-50 text-rose-600',
  primary: 'bg-emerald-50 text-emerald-600',
  neutral: 'bg-stone-100 text-stone-600',
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  confirmLabel: string
  pendingLabel?: string
  cancelLabel?: string
  tone?: Tone
  pending?: boolean
  error?: string | null
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel = 'Processando…',
  cancelLabel = 'Cancelar',
  tone = 'neutral',
  pending = false,
  error = null,
  onConfirm,
}: Props) {
  return (
    <Dialog.Root
      open={open}
      // Block dismissal mid-flight so a half-finished action can't be orphaned.
      onOpenChange={(next) => {
        if (pending) return
        onOpenChange(next)
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />

        <Dialog.Content
          onEscapeKeyDown={(e) => pending && e.preventDefault()}
          onInteractOutside={(e) => pending && e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95"
        >
          <div className="flex gap-4">
            <div
              aria-hidden
              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${ICON_STYLES[tone]}`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <Dialog.Title className="font-serif text-xl text-stone-900">
                {title}
              </Dialog.Title>
              <Dialog.Description asChild>
                <div className="mt-2 text-sm leading-relaxed text-stone-600">
                  {description}
                </div>
              </Dialog.Description>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm leading-relaxed text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Dialog.Close asChild>
              <button
                type="button"
                disabled={pending}
                className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
            </Dialog.Close>

            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${CONFIRM_STYLES[tone]}`}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {pending ? pendingLabel : confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
