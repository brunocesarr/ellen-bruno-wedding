'use client'

import { upsertSiteImageAction } from '@/app/admin/_actions/site-images.actions'
import { SmartImage } from '@/components/ui/SmartImage'
import type { SiteImageViewModel } from '@/src/interface-adapters/view-models/site-image.view-model'
import type { SiteImageDef } from '@/src/lib/site-images-catalog'
import * as Dialog from '@radix-ui/react-dialog'
import imageCompression from 'browser-image-compression'
import { Loader2, Upload, X } from 'lucide-react'
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'

type Props = {
  def: SiteImageDef
  stored: SiteImageViewModel | null
  trigger: ReactNode
}

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]

const MAX_ORIGINAL_FILE_SIZE = 20 * 1024 * 1024

export function SiteImageUploadDialog({ def, stored, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>()
  const [isCompressing, setIsCompressing] = useState(false)
  const [compressionError, setCompressionError] = useState<string | null>()

  const fileRef = useRef<HTMLInputElement>(null)

  const [state, formAction, isPending] = useActionState(
    upsertSiteImageAction,
    null,
  )

  useEffect(() => {
    if (!state?.ok) return

    setOpen(false)
    setPreview(null)
    setCompressionError(null)

    if (fileRef.current) {
      fileRef.current.value = ''
    }
  }, [state])

  useEffect(() => {
    return () => {
      if (preview?.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  function handleOpenChange(nextOpen: boolean) {
    if (isPending || isCompressing) return

    setOpen(nextOpen)

    if (!nextOpen) {
      setPreview(null)
      setCompressionError(null)

      if (fileRef.current) {
        fileRef.current.value = ''
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]

    setCompressionError(null)

    if (!file) {
      setPreview(null)
      return
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      event.currentTarget.value = ''
      setPreview(null)
      setCompressionError('Use uma imagem JPG, PNG ou WEBP.')
      return
    }

    if (file.size > MAX_ORIGINAL_FILE_SIZE) {
      event.currentTarget.value = ''
      setPreview(null)
      setCompressionError(
        'A imagem original é muito grande. Escolha uma imagem de até 20 MB.',
      )
      return
    }

    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isPending || isCompressing) return

    setCompressionError(null)

    const formData = new FormData(event.currentTarget)
    const image = formData.get('image')

    if (image instanceof File && image.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        setCompressionError('Use uma imagem JPG, PNG ou WEBP.')
        return
      }

      if (image.size > MAX_ORIGINAL_FILE_SIZE) {
        setCompressionError(
          'A imagem original é muito grande. Escolha uma imagem de até 20 MB.',
        )
        return
      }

      setIsCompressing(true)

      try {
        const compressedBlob = await imageCompression(image, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.82,
          fileType: 'image/webp',
        })

        const baseName =
          image.name.replace(/\.[^/.]+$/, '').trim() || 'wedding-image'

        const compressedFile = new File(
          [compressedBlob],
          `${baseName}.webp`,
          {
            type: 'image/webp',
            lastModified: Date.now(),
          },
        )

        formData.set('image', compressedFile)
      } catch (error) {
        console.error('Failed to compress image:', error)

        setCompressionError(
          'Não foi possível comprimir a imagem. Tente outra imagem.',
        )

        return
      } finally {
        setIsCompressing(false)
      }
    }

    startTransition(() => {
      formAction(formData)
    })
  }

  const isProcessing = isPending || isCompressing

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />

        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-md
            -translate-x-1/2 -translate-y-1/2 overflow-hidden
            rounded-2xl bg-white shadow-2xl
            data-[state=open]:animate-in
            data-[state=open]:zoom-in-95
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
              aria-label="Fechar"
              disabled={isProcessing}
              className="text-stone-400 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <input type="hidden" name="key" value={def.key} />
            <input type="hidden" name="section" value={def.section} />
            <input type="hidden" name="isActive" value="true" />

            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
              <SmartImage
                src={preview ?? stored?.imageUrl ?? def.fallback}
                fallback={def.fallback}
                alt={stored?.alt ?? def.label}
                fill
                sizes="500px"
                className="object-cover"
              />
            </div>

            <label
              className={`
                flex flex-col gap-2 rounded-xl border-2 border-dashed
                border-stone-200 bg-stone-50 p-4 text-center transition
                ${
                  isProcessing
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/40'
                }
              `}
            >
              {isCompressing ? (
                <Loader2 className="mx-auto h-5 w-5 animate-spin text-amber-700" />
              ) : (
                <Upload className="mx-auto h-5 w-5 text-stone-400" />
              )}

              <span className="text-sm font-medium text-stone-700">
                {isCompressing ? 'Comprimindo imagem...' : 'Escolher imagem'}
              </span>

              <span className="text-xs text-stone-400">
                JPG, PNG ou WEBP — a imagem será otimizada antes do envio
              </span>

              <input
                ref={fileRef}
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isProcessing}
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
                disabled={isProcessing}
                className="
                  w-full rounded-lg border border-stone-300 px-3 py-2
                  text-sm outline-none focus:border-amber-600
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              />
            </label>

            {compressionError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {compressionError}
              </p>
            )}

            {state && !state.ok && !compressionError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {state.error}
              </p>
            )}

            <footer className="flex justify-end gap-2 pt-2">
              <Dialog.Close
                disabled={isProcessing}
                className="
                  rounded-full px-4 py-2 text-sm text-stone-600
                  hover:bg-stone-100 disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Cancelar
              </Dialog.Close>

              <button
                type="submit"
                disabled={isProcessing}
                className="
                  inline-flex items-center gap-2 rounded-full bg-amber-700
                  px-5 py-2 text-sm font-medium text-white
                  hover:bg-amber-600 disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isProcessing && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}

                {isCompressing
                  ? 'Comprimindo...'
                  : isPending
                    ? 'Enviando...'
                    : 'Salvar'}
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}