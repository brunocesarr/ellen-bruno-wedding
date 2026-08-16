'use client'

import {
  createGiftAction,
  type GiftFormActionState,
  updateGiftAction,
} from '@/app/admin/_actions/gifts.actions'
import { DialogShell } from '@/components/ui/DialogShell'
import { FormField as Field } from '@/components/ui/FormField'
import { GIFT_KINDS, type GiftKind } from '@/src/entities/models/gift'
import type { GiftViewModel } from '@/src/interface-adapters/view-models/gift.view-model'
import { inputField as inputClassName } from '@/src/lib/class-names'
import * as Dialog from '@radix-ui/react-dialog'
import { ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

const CATEGORIES = [
  { value: 'home', label: 'Casa' },
  { value: 'kitchen', label: 'Cozinha' },
  { value: 'travel', label: 'Viagem' },
  { value: 'experience', label: 'Experiência' },
  { value: 'other', label: 'Outros' },
] as const

const KIND_OPTIONS: Record<GiftKind, { label: string; hint: string }> = {
  fixed_item: { label: 'Preço fixo', hint: 'Um valor, um comprador.' },
  open_item: {
    label: 'Sem preço definido',
    hint: 'O comprador escolhe quanto pagar. Um comprador.',
  },
  fund: { label: 'Vaquinha', hint: 'Várias pessoas contribuem.' },
}

// Empty is valid for every kind — clear the field for a no-suggestion gift.
const DEFAULT_SUGGESTED: Record<GiftKind, string> = {
  fixed_item: '',
  open_item: '100, 200, 350',
  fund: '50, 150, 300, 500',
}

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

  // Single source of truth for `kind`. Submitted via the hidden input below —
  // never via the option controls themselves. Drives conditional rendering too;
  // this form is uncontrolled, so unmounted inputs simply drop out of FormData.
  const [kind, setKind] = useState<GiftKind>(gift?.kind ?? 'fixed_item')
  const kindLocked = (gift?.contributorCount ?? 0) > 0

  const currentImageUrl = gift?.imageUrl ?? null

  const clearSelectedFile = useCallback(() => {
    setPreviewUrl((currentPreviewUrl) => {
      if (currentPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(currentPreviewUrl)
      }

      return null
    })

    setSelectedFileName(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const resetForm = useCallback(() => {
    clearSelectedFile()
    formRef.current?.reset()
    setKind(gift?.kind ?? 'fixed_item')
  }, [clearSelectedFile, gift?.kind])

  const submitAction = useCallback(
    async (
      previousState: GiftFormActionState,
      formData: FormData
    ): Promise<GiftFormActionState> => {
      console.log(
        'Submitting form data:',
        Object.fromEntries(formData.entries())
      )
      const result = isEdit
        ? await updateGiftAction(previousState, formData)
        : await createGiftAction(previousState, formData)

      if (result?.ok) {
        resetForm()
        setOpen(false)
        router.refresh()
      }

      return result
    },
    [isEdit, resetForm, router]
  )

  const [state, formAction, isPending] = useActionState<
    GiftFormActionState,
    FormData
  >(submitAction, null)

  // handle() returns ValidationError as { error, issues }. Surface the field
  // paths from z.flattenError instead of only the generic "Dados inválidos".
  const fieldErrors: Record<string, string[]> =
    state && !state.ok ? (state.issues?.fieldErrors ?? {}) : {}
  const formErrors: string[] =
    state && !state.ok ? (state.issues?.formErrors ?? []) : []
  const fieldError = (key: string): string | undefined => fieldErrors[key]?.[0]

  const previewSrc = useMemo(
    () => previewUrl || currentImageUrl || null,
    [previewUrl, currentImageUrl]
  )

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]

    if (!file) {
      clearSelectedFile()
      return
    }

    if (previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFileName(file.name)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return

    setOpen(nextOpen)

    if (!nextOpen) {
      clearSelectedFile()
      setKind(gift?.kind ?? 'fixed_item')
    }
  }

  return (
    <DialogShell
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      contentClassName="max-h-[92vh] w-[92vw] max-w-2xl"
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
          disabled={isPending}
          className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Dialog.Close>
      </header>

      <form
        ref={formRef}
        action={formAction}
        className="max-h-[calc(92vh-76px)] overflow-y-auto p-5 md:p-6"
      >
        {gift?.id && <input type="hidden" name="id" value={gift.id} />}

        {/* The ONLY `kind` control in the form. Radios inside FormField's
            <label> produced nested labels: the outer label targeted its first
            labelable descendant (fixed_item) and forwarded every click there,
            so FormData carried fixed_item no matter which card was picked.
            Always rendered — also covers the kindLocked case. */}
        <input type="hidden" name="kind" value={kind} />

        <div className="grid gap-5 md:grid-cols-[220px_1fr]">
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
              className={`
                flex flex-col items-center justify-center gap-2 rounded-xl
                border-2 border-dashed border-stone-200 bg-stone-50
                px-4 py-5 text-center transition
                ${
                  isPending
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/50'
                }
              `}
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
                disabled={isPending}
                className="sr-only"
              />
            </label>

            {selectedFileName && (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                <span className="truncate">{selectedFileName}</span>

                <button
                  type="button"
                  onClick={clearSelectedFile}
                  disabled={isPending}
                  className="font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                >
                  remover
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Field label="Nome" error={fieldError('name')}>
              <input
                name="name"
                required
                defaultValue={gift?.name ?? ''}
                placeholder="Ex: Jogo de panelas"
                disabled={isPending}
                className={inputClassName}
              />
            </Field>

            <Field label="Descrição" error={fieldError('description')}>
              <textarea
                name="description"
                rows={3}
                defaultValue={gift?.description ?? ''}
                placeholder="Conte um pouco sobre este presente..."
                disabled={isPending}
                className={inputClassName}
              />
            </Field>

            {/* Plain <div> + <span>, deliberately NOT <Field>: FormField renders
                a <label>, and a label must not wrap multiple form controls. */}
            <div className="block">
              <span
                id="gift-kind-label"
                className="mb-1.5 block text-xs font-medium text-stone-600"
              >
                Tipo de presente
              </span>

              <div
                role="radiogroup"
                aria-labelledby="gift-kind-label"
                className="grid gap-2 sm:grid-cols-3"
              >
                {GIFT_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={kind === k}
                    disabled={isPending || kindLocked}
                    onClick={() => setKind(k)}
                    className={`
                      rounded-xl border p-3 text-left transition
                      ${
                        kind === k
                          ? 'border-amber-600 bg-amber-50/60'
                          : 'border-stone-200 hover:border-stone-300'
                      }
                      ${
                        isPending || kindLocked
                          ? 'cursor-not-allowed opacity-60'
                          : 'cursor-pointer'
                      }
                    `}
                  >
                    <span className="block text-sm font-medium text-stone-800">
                      {KIND_OPTIONS[k].label}
                    </span>

                    <span className="mt-0.5 block text-[11px] text-stone-500">
                      {KIND_OPTIONS[k].hint}
                    </span>
                  </button>
                ))}
              </div>

              {fieldError('kind') && (
                <span className="mt-1 block text-xs text-rose-600">
                  {fieldError('kind')}
                </span>
              )}

              {kindLocked && (
                <p className="mt-1.5 text-xs text-amber-700">
                  O tipo não pode ser alterado: {gift?.contributorCount}{' '}
                  contribuição(ões) registrada(s).
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Categoria" error={fieldError('category')}>
                <select
                  name="category"
                  defaultValue={gift?.category ?? 'other'}
                  disabled={isPending}
                  className={inputClassName}
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </Field>

              {kind === 'fixed_item' ? (
                <Field label="Valor (R$)" error={fieldError('price')}>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={gift?.price ?? ''}
                    placeholder="250,00"
                    disabled={isPending}
                    className={inputClassName}
                  />
                </Field>
              ) : (
                <Field
                  label="Valor mínimo (R$) — opcional"
                  error={fieldError('minAmount')}
                >
                  <input
                    name="minAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={gift?.minAmount ?? ''}
                    placeholder="50,00"
                    disabled={isPending}
                    className={inputClassName}
                  />
                </Field>
              )}

              {kind === 'fund' && (
                <Field
                  label="Meta (R$) — opcional"
                  error={fieldError('goalAmount')}
                >
                  <input
                    name="goalAmount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={gift?.goalAmount ?? ''}
                    placeholder="3000,00"
                    disabled={isPending}
                    className={inputClassName}
                  />
                </Field>
              )}

              {kind !== 'fixed_item' && (
                <div className="sm:col-span-2">
                  {/* key={kind} remounts the input so defaultValue refreshes on
                      switch — React keeps the stale uncontrolled value otherwise. */}
                  <Field
                    label="Valores sugeridos (até 4, separados por vírgula)"
                    error={fieldError('suggestedAmounts')}
                  >
                    <input
                      name="suggestedAmounts"
                      key={kind}
                      defaultValue={
                        gift?.suggestedAmounts.length
                          ? gift.suggestedAmounts.join(', ')
                          : DEFAULT_SUGGESTED[kind]
                      }
                      placeholder="50, 150, 300"
                      disabled={isPending}
                      className={inputClassName}
                    />
                  </Field>

                  <p className="mt-1 text-[11px] text-stone-400">
                    Um campo vazio ancora as contribuições para baixo — deixe
                    sugestões.
                  </p>
                </div>
              )}
            </div>

            {state && !state.ok && (
              <div
                role="alert"
                className="space-y-1 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                <p className="font-medium">{state.error}</p>

                {formErrors.map((message) => (
                  <p key={message} className="text-xs">
                    {message}
                  </p>
                ))}

                {/* A field error on an unmounted input (e.g. `price` while
                    kind=fund) would otherwise render nowhere at all. */}
                {Object.entries(fieldErrors).map(([field, messages]) => (
                  <p key={field} className="text-xs">
                    <span className="font-medium">{field}:</span> {messages[0]}
                  </p>
                ))}
              </div>
            )}

            <footer className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <Dialog.Close
                disabled={isPending}
                className="rounded-full px-5 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
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
    </DialogShell>
  )
}
