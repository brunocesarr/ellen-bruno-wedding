'use client'

import { upsertSiteImageAction } from '@/app/admin/_actions/site-images.actions'
import { SmartImage } from '@/components/ui/SmartImage'
import type { SiteImageViewModel } from '@/src/interface-adapters/view-models/site-image.view-model'
import type { SiteImageDef } from '@/src/lib/site-images-catalog'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, Upload, X } from 'lucide-react'
import { useActionState, useEffect, useRef, useState } from 'react'

type Props = {
  def: SiteImageDef
  stored: SiteImageViewModel | null
  trigger: React.ReactNode
}

export function SiteImageUploadDialog({ def, stored, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [state, formAction, isPending] = useActionState(
    upsertSiteImageAction,
    null
  )

  useEffect(() => {
    if (state?.ok) {
      setOpen(false)
      setPreview(null)
    }
  }, [state])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      setPreview(null)
      return
    }
    setPreview(URL.createObjectURL(file))
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="
           fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2
           overflow-hidden rounded-2xl bg-white shadow-2xl
           data-[state=open]:animate-in data-[state=open]:zoom-in-95
         "
        >
          <header className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
            <div>
              <Dialog.Title className="font-serif text-lg text-stone-900">
                {def.label}
              </Dialog.Title>
              <Dialog.Description className="text-xs text-stone-500">
                Tamanho recomendado: 1200×1600 (vertical) ou 1600×1200
                (horizontal)
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="text-stone-400 hover:text-stone-700"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <form action={formAction} className="space-y-4 p-6">
            <input type="hidden" name="key" value={def.key} />
            <input type="hidden" name="section" value={def.section} />
            <input type="hidden" name="isActive" value="true" />

            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
              <SmartImage
                src={preview ?? stored?.imageUrl ?? def.fallback}
                fallback={def.fallback}
                alt=""
                fill
                sizes="500px"
                className="object-cover"
              />
            </div>

            <label className="flex cursor-pointer flex-col gap-2 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50 p-4 text-center transition hover:border-amber-400 hover:bg-amber-50/40">
              <Upload className="mx-auto h-5 w-5 text-stone-400" />
              <span className="text-sm font-medium text-stone-700">
                Escolher imagem
              </span>
              <span className="text-xs text-stone-400">
                JPG, PNG ou WEBP — até 5 MB
              </span>
              <input
                ref={fileRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={onFileChange}
                className="sr-only"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">
                Texto alternativo (acessibilidade)
              </span>
              <input
                type="text"
                name="alt"
                defaultValue={stored?.alt ?? def.label}
                maxLength={200}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-600"
              />
            </label>

            {state && !state.ok && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {state.error}
              </p>
            )}

            <footer className="flex justify-end gap-2 pt-2">
              <Dialog.Close className="rounded-full px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Salvar
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
