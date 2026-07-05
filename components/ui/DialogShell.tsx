'use client'

import { cn } from '@/src/lib/utils'
import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

const OVERLAY =
  'fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in'

const CONTENT_BASE =
  'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95'

export function DialogShell({
  trigger,
  open,
  onOpenChange,
  contentClassName,
  children,
}: {
  trigger: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  contentClassName?: string
  children: ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className={OVERLAY} />
        <Dialog.Content className={cn(CONTENT_BASE, contentClassName)}>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
