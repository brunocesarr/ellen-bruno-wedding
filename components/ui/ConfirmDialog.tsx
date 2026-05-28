'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import type { ReactNode } from 'react'

type Tone = 'danger' | 'default'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: Tone
  pending?: boolean
  onConfirm: () => void
}

const TONE_STYLES: Record<
  Tone,
  { icon: string; iconBg: string; button: string }
> = {
  danger: {
    icon: 'text-rose-600',
    iconBg: 'bg-rose-100',
    button: 'bg-rose-600 hover:bg-rose-500 focus-visible:ring-rose-400',
  },
  default: {
    icon: 'text-amber-700',
    iconBg: 'bg-amber-100',
    button: 'bg-amber-700 hover:bg-amber-600 focus-visible:ring-amber-400',
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'default',
  pending = false,
  onConfirm,
}: Props) {
  const styles = TONE_STYLES[tone]

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (pending && !next) return // block close while running
        onOpenChange(next)
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />

        <Dialog.Content
          className="
          fixed left-1/2 top-1/2 z-50
          w-[92vw] max-w-md
          -translate-x-1/2 -translate-y-1/2
          overflow-hidden rounded-2xl bg-white shadow-2xl
          data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95
        "
        >
          <div className="flex items-start gap-4 px-5 pt-5 md:px-6 md:pt-6">
            <span
              className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full ${styles.iconBg}`}
            >
              <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
            </span>

            <div className="min-w-0 flex-1">
              <Dialog.Title className="font-serif text-lg text-stone-900">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-stone-600">
                  {description}
                </Dialog.Description>
              )}
            </div>

            <Dialog.Close
              className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:opacity-50"
              aria-label="Fechar"
              disabled={pending}
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <footer className="mt-6 flex flex-col-reverse gap-2 bg-stone-50 px-5 py-4 md:flex-row md:justify-end md:px-6">
            <Dialog.Close
              className="rounded-full px-5 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100 disabled:opacity-50"
              disabled={pending}
            >
              {cancelLabel}
            </Dialog.Close>

            <button
              type="button"
              onClick={onConfirm}
              disabled={pending}
              className={`
              inline-flex items-center justify-center gap-2 rounded-full
              px-6 py-2.5 text-sm font-medium text-white shadow-sm transition
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
              disabled:cursor-not-allowed disabled:opacity-60
              ${styles.button}
            `}
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmLabel}
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
