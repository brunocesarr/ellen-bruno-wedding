'use client'

import {
  createGuestAction,
  updateGuestAction,
} from '@/app/admin/_actions/guests.actions'
import { FormField as Field } from '@/components/ui/FormField'
import { inputField as inputClassName } from '@/src/lib/class-names'
import {
  CreateGuestInputSchema,
  GUEST_STATUSES,
  type CreateGuestInput,
  type Guest,
  type GuestStatus,
} from '@/src/entities/models/guest'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

/* ------------------------------------------------------------------ */
/*  Form schema                                                       */
/*  Mirrors CreateGuestInputSchema but adapted to a controlled form:  */
/*  - notes always a string (empty string when unset)                 */
/*  - partyId is hidden (only used when adding a companion)           */
/* ------------------------------------------------------------------ */
const guestFormSchema = CreateGuestInputSchema.extend({
  notes: z.string().max(500, 'Máximo 500 caracteres').optional().default(''),
})
// `.default()` on `notes`/`status` makes the schema input ≠ output, so we
// keep both types and pass them to useForm's <Input, Context, Output> generics.
type GuestFormInput = z.input<typeof guestFormSchema>
type GuestFormValues = z.output<typeof guestFormSchema>

const STATUS_OPTIONS: { value: GuestStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'going', label: 'Confirmado' },
  { value: 'not_going', label: 'Não vai' },
]

type Props = {
  trigger: React.ReactNode
  /** Edit mode: pass an existing guest. */
  guest?: Guest
  /**
   * Create-companion mode: pass the partyId of an existing guest so that
   * the new entry shares the same party (associated guests).
   */
  parentPartyId?: string
  /** Optional callback fired after a successful save. */
  onSaved?: (guest: Guest) => void
}

export function GuestFormDialog({
  trigger,
  guest,
  parentPartyId,
  onSaved,
}: Props) {
  const isEdit = Boolean(guest)
  const router = useRouter()

  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultValues: GuestFormInput = {
    firstName: guest?.firstName ?? '',
    lastName: guest?.lastName ?? '',
    status: guest?.status ?? 'pending',
    notes: guest?.notes ?? '',
    partyId: guest?.partyId ?? parentPartyId,
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GuestFormInput, unknown, GuestFormValues>({
    resolver: zodResolver(guestFormSchema),
    defaultValues,
    mode: 'onSubmit',
  })

  // Reset the form whenever the dialog is reopened with new props
  useEffect(() => {
    if (open) reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, guest?.id, parentPartyId])

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null)

    const payload: CreateGuestInput & { id?: string } = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      status: values.status,
      notes: values.notes?.trim() || undefined,
      partyId: values.partyId,
    }

    const res = isEdit
      ? await updateGuestAction({ id: guest!.id, ...payload })
      : await createGuestAction(payload)

    if (!res.ok) {
      setServerError(res.error)
      return
    }

    onSaved?.(res.data)
    setOpen(false)
    reset()
    router.refresh()
  })

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          setServerError(null)
          reset(defaultValues)
        }
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />

        <Dialog.Content
          className="
        fixed left-1/2 top-1/2 z-50
        max-h-[92vh] w-[92vw] max-w-xl
        -translate-x-1/2 -translate-y-1/2
        overflow-hidden rounded-2xl bg-white shadow-2xl
        data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95
      "
        >
          <header className="flex items-start justify-between border-b border-stone-100 px-5 py-4 md:px-6">
            <div>
              <Dialog.Title className="font-serif text-xl text-stone-900">
                {isEdit
                  ? 'Editar convidado'
                  : parentPartyId
                    ? 'Novo acompanhante'
                    : 'Novo convidado'}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-stone-500">
                {isEdit
                  ? 'Atualize os dados do convidado.'
                  : parentPartyId
                    ? 'O acompanhante usará o mesmo convite do titular.'
                    : 'Cadastre um novo convidado para gerar um link de convite individual.'}
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
            onSubmit={onSubmit}
            noValidate
            className="max-h-[calc(92vh-76px)] overflow-y-auto p-5 md:p-6"
          >
            {/* hidden party id used for associated guests */}
            {defaultValues.partyId && (
              <input type="hidden" {...register('partyId')} />
            )}

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome" error={errors.firstName?.message}>
                  <input
                    {...register('firstName')}
                    autoFocus
                    placeholder="Ex: Ellen"
                    className={inputClassName}
                  />
                </Field>

                <Field label="Sobrenome" error={errors.lastName?.message}>
                  <input
                    {...register('lastName')}
                    placeholder="Ex: Silva"
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field label="Status" error={errors.status?.message}>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="
                      relative cursor-pointer rounded-lg border border-stone-200
                      bg-white px-3 py-2.5 text-sm text-stone-600
                      transition has-[:checked]:border-amber-600
                      has-[:checked]:bg-amber-50 has-[:checked]:text-amber-800
                    "
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register('status')}
                        className="sr-only"
                      />
                      <span className="flex items-center justify-center gap-2 font-medium">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${dotByStatus[opt.value]}`}
                        />
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field
                label="Observações (opcional)"
                error={errors.notes?.message}
              >
                <textarea
                  {...register('notes')}
                  rows={3}
                  maxLength={500}
                  placeholder="Restrições alimentares, parentesco, etc."
                  className={inputClassName}
                />
              </Field>

              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  {serverError}
                </div>
              )}

              <footer className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Dialog.Close className="rounded-full px-5 py-2.5 text-sm text-stone-600 transition hover:bg-stone-100">
                  Cancelar
                </Dialog.Close>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                  inline-flex items-center justify-center gap-2 rounded-full
                  bg-amber-700 px-6 py-2.5 text-sm font-medium text-white
                  shadow-sm transition hover:bg-amber-600
                  disabled:cursor-not-allowed disabled:opacity-60
                "
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting
                    ? isEdit
                      ? 'Salvando...'
                      : 'Criando...'
                    : isEdit
                      ? 'Salvar'
                      : 'Criar'}
                </button>
              </footer>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const dotByStatus: Record<GuestStatus, string> = {
  pending: 'bg-amber-500',
  going: 'bg-emerald-500',
  not_going: 'bg-rose-500',
}

/** Re-export to keep types exhaustive (and prevent dead-code shaking). */
export const _GUEST_STATUSES = GUEST_STATUSES
