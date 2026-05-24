'use client'

import { upsertGift } from '@/lib/admin/gifts'
import { GiftCategorySchema } from '@/src/entities/models/gift'
import { GiftViewModel } from '@/src/interface-adapters/view-models/gift.view-model'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  description: z.string().optional(),
  category: GiftCategorySchema.optional(),
  price: z.coerce.number().min(0).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export function GiftFormDialog({
  trigger,
  gift = undefined,
}: {
  trigger: React.ReactNode
  gift?: GiftViewModel
}) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const isEdit = !!gift

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: gift?.name ?? '',
      description: gift?.description ?? undefined,
      category: gift?.category ?? undefined,
      price: gift?.price,
      imageUrl: gift?.imageUrl ?? '',
    },
  })

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      await upsertGift({ id: gift?.id, ...values })
      reset()
      setOpen(false)
    })
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          className="
          fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2
          overflow-hidden rounded-2xl bg-white shadow-2xl
          data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95
        "
        >
          <header className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
            <Dialog.Title className="font-serif text-xl text-stone-900">
              {isEdit ? 'Editar presente' : 'Novo presente'}
            </Dialog.Title>
            <Dialog.Close className="text-stone-400 hover:text-stone-700">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
            <Field label="Nome" error={errors.name?.message}>
              <input
                {...register('name')}
                className={input}
                placeholder="Ex: Jogo de panelas"
              />
            </Field>

            <Field label="Descrição" error={errors.description?.message}>
              <textarea
                {...register('description')}
                rows={2}
                className={input}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoria">
                <input
                  {...register('category')}
                  className={input}
                  placeholder="Cozinha"
                />
              </Field>
              <Field label="Valor (R$)">
                <input
                  type="number"
                  step="0.01"
                  {...register('price')}
                  className={input}
                  placeholder="250,00"
                />
              </Field>
            </div>

            <Field label="URL da imagem" error={errors.imageUrl?.message}>
              <input
                {...register('imageUrl')}
                className={input}
                placeholder="https://..."
              />
            </Field>

            <footer className="flex justify-end gap-2 pt-2">
              <Dialog.Close className="rounded-full px-4 py-2 text-sm text-stone-600 hover:bg-stone-100">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? 'Salvar' : 'Criar'}
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const input =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-600'

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-stone-600">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-rose-600">{error}</span>
      )}
    </label>
  )
}
