'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { StickyNote, X } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = {
  trigger: ReactNode
  guestName: string
  notes: string
}

export function GuestNotesDialog({ trigger, guestName, notes }: Props) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

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
          <header className="flex items-start justify-between border-b border-stone-100 px-5 py-4 md:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800">
                <StickyNote className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <Dialog.Title className="font-serif text-lg text-stone-900">
                  Observações
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 truncate text-xs text-stone-500">
                  {guestName}
                </Dialog.Description>
              </div>
            </div>

            <Dialog.Close
              className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <div className="px-5 py-5 md:px-6">
            <p className="whitespace-pre-wrap rounded-xl bg-amber-50/60 p-4 text-sm leading-relaxed text-stone-700">
              {notes}
            </p>
          </div>

          <footer className="flex justify-end border-t border-stone-100 bg-stone-50 px-5 py-3 md:px-6">
            <Dialog.Close className="rounded-full px-5 py-2 text-sm text-stone-600 transition hover:bg-stone-100">
              Fechar
            </Dialog.Close>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
