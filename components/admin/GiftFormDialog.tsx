'use client'

import {
  createGiftAction,
  type GiftFormActionState,
  updateGiftAction,
} from '@/app/admin/_actions/gifts.actions'
import { FormField as Field } from '@/components/ui/FormField'
import { inputField as inputClassName } from '@/src/lib/class-names'
import type { GiftViewModel } from '@/src/interface-adapters/view-models/gift.view-model'
import * as Dialog from '@radix-ui/react-dialog'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useMemo, useRef, useState } from 'react'

const CATEGORIES = [
  { value: 'home', label: 'Casa' },
  { value: 'kitchen', label: 'Cozinha' },
  { value: 'travel', label: 'Viagem' },
  { value: 'experience', label: 'Experiência' },
  { value: 'other', label: 'Outros' },
] as const

type Props = {
  trigger: React.ReactNode
  gift?: GiftViewModel
}

export function GiftFormDialog({ trigger, gift }: Props) {
  const isEdit = Boolean(gift)
  const router = useRouter()

  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>()
  const [selectedFileName, setSelectedFileName] = useState<string | null>()

  const action = isEdit ? updateGiftAction : createGiftAction

  const [state, formAction, isPending] = useActionState<
    GiftFormActionState,
    FormData
  >(action, null)

  const currentImageUrl = gift?.imageUrl ?? null

  const previewSrc = useMemo(() => {
    return previewUrl || currentImageUrl || null
  }, [previewUrl, currentImageUrl])

  useEffect(() => {
    if (!state?.ok) return

    setOpen(false)
    setSelectedFileName(null)
    setPreviewUrl(null)
    formRef.current?.reset()
    router.refresh()
  }, [state, router])

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedFileName(null)
      setPreviewUrl(null)
      return
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFileName(file.name)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function clearSelectedFile() {
    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    setPreviewUrl(null)
    setSelectedFileName(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)

        if (!nextOpen) {
          clearSelectedFile()
        }
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />

        <Dialog.Content
          className="
          fixed left-1/2 top-1/2 z-50
          max-h-[92vh] w-[92vw] max-w-2xl
          -translate-x-1/2 -translate-y-1/2
          overflow-hidden rounded-2xl bg-white shadow-2xl
          data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95
        "
        >
          <header className="flex items-start justify-between border-b border-stone-100 px-5 py-4 md:px-6">
            <div>
              <Dialog.Title className="font-serif text-xl text-stone-900">
                {isEdit ? 'Editar presente' : 'Novo presente'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-stone-500">
                {isEdit
                  ? 'Atualize os dados e, se desejar, substitua a imagem.'
                  : 'Cadastre um novo presente com foto para aparecer na lista.'}
              </Dialog.Description>
            </div>

            <Dialog.Close
              className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <form
            ref={formRef}
            action={formAction}
            encType="multipart/form-data"
            className="max-h-[calc(92vh-76px)] overflow-y-auto p-5 md:p-6"
          >
            {gift?.id && <input type="hidden" name="id" value={gift.id} />}

            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              {/* Image upload */}
              <div className="space-y-3">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                  {previewSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewSrc}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-stone-400">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs">Sem imagem</span>
                    </div>
                  )}

                  {selectedFileName && (
                    <span className="absolute left-3 top-3 rounded-full bg-emerald-50/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200 backdrop-blur">
                      Nova imagem
                    </span>
                  )}

                  {!selectedFileName && currentImageUrl && (
                    <span className="absolute left-3 top-3 rounded-full bg-amber-50/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-700 ring-1 ring-amber-200 backdrop-blur">
                      Atual
                    </span>
                  )}
                </div>

                <label
                  className="
                  flex cursor-pointer flex-col items-center justify-center gap-2
                  rounded-xl border-2 border-dashed border-stone-200
                  bg-stone-50 px-4 py-5 text-center
                  transition hover:border-amber-400 hover:bg-amber-50/50
                "
                >
                  <Upload className="h-5 w-5 text-stone-400" />
                  <span className="text-sm font-medium text-stone-700">
                    {isEdit ? 'Substituir imagem' : 'Enviar imagem'}
                  </span>
                  <span className="text-xs text-stone-400">
                    JPG, PNG ou WEBP até 5MB
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                {selectedFileName && (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <span className="truncate">{selectedFileName}</span>
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      className="font-medium hover:underline"
                    >
                      remover
                    </button>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <Field label="Nome">
                  <input
                    name="name"
                    required
                    defaultValue={gift?.name ?? ''}
                    placeholder="Ex: Jogo de panelas"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Descrição">
                  <textarea
                    name="description"
                    rows={3}
                    defaultValue={gift?.description ?? ''}
                    placeholder="Conte um pouco sobre este presente..."
                    className={inputClassName}
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Categoria">
                    <select
                      name="category"
                      defaultValue={gift?.category ?? 'other'}
                      className={inputClassName}
                    >
                      {CATEGORIES.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Valor (R$)">
                    <input
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      defaultValue={gift?.price ?? ''}
                      placeholder="250,00"
                      className={inputClassName}
                    />
                  </Field>
                </div>

                {state && !state.ok && (
                  <div
                    role="alert"
                    className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {state.error}
                  </div>
                )}

                <footer className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                  <Dialog.Close className="rounded-full px-5 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100">
                    Cancelar
                  </Dialog.Close>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="
                    inline-flex items-center justify-center gap-2 rounded-full
                    bg-amber-700 px-6 py-2.5 text-sm font-medium text-white
                    shadow-sm transition hover:bg-amber-600
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                  >
                    {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isPending
                      ? isEdit
                        ? 'Salvando...'
                        : 'Criando...'
                      : isEdit
                        ? 'Salvar'
                        : 'Criar'}
                  </button>
                </footer>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
