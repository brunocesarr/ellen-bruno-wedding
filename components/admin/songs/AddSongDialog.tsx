'use client'

import { createSongAction } from '@/app/admin/_actions/songs.actions'
import * as Dialog from '@radix-ui/react-dialog'
import { Loader2, Music, Plus, X } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { useActionState, useRef, useState } from 'react'

const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3']
const MAX_AUDIO_SIZE = 15 * 1024 * 1024

type CreateSongState = Awaited<ReturnType<typeof createSongAction>> | null

export function AddSongDialog() {
  const [open, setOpen] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  const wrappedAction = async (
    previousState: CreateSongState,
    formData: FormData
  ): Promise<CreateSongState> => {
    const result = await createSongAction(previousState, formData)
    if (result.ok) {
      formRef.current?.reset()
      setFileError(null)
      setOpen(false)
    }
    return result
  }

  const [state, formAction, isPending] = useActionState<
    CreateSongState,
    FormData
  >(wrappedAction, null)

  function handleOpenChange(nextOpen: boolean) {
    if (isPending) return
    setOpen(nextOpen)
    if (!nextOpen) {
      formRef.current?.reset()
      setFileError(null)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0]
    setFileError(null)

    if (!file) return

    if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
      event.currentTarget.value = ''
      setFileError('Use um arquivo MP3.')
      return
    }

    if (file.size > MAX_AUDIO_SIZE) {
      event.currentTarget.value = ''
      setFileError('Arquivo muito grande. Envie um áudio de até 15MB.')
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-amber-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" />
          Adicionar música
        </button>
      </Dialog.Trigger>

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
            <Dialog.Title className="font-serif text-lg text-stone-900">
              Nova música
            </Dialog.Title>

            <Dialog.Close
              aria-label="Fechar"
              disabled={isPending}
              className="text-stone-400 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </header>

          <form ref={formRef} action={formAction} className="space-y-4 p-6">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-stone-600">
                Título
              </span>
              <input
                type="text"
                name="title"
                required
                maxLength={120}
                disabled={isPending}
                placeholder="Ex: Nossa canção"
                className="
                  w-full rounded-lg border border-stone-300 px-3 py-2
                  text-sm outline-none focus:border-amber-600
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              />
            </label>

            <label
              className={`
                flex flex-col gap-2 rounded-xl border-2 border-dashed
                border-stone-200 bg-stone-50 p-4 text-center transition
                ${
                  isPending
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:border-amber-400 hover:bg-amber-50/40'
                }
              `}
            >
              <Music className="mx-auto h-5 w-5 text-stone-400" />
              <span className="text-sm font-medium text-stone-700">
                Escolher arquivo
              </span>
              <span className="text-xs text-stone-400">MP3 — até 15MB</span>

              <input
                ref={fileRef}
                type="file"
                name="audio"
                required
                accept="audio/mpeg,audio/mp3"
                onChange={handleFileChange}
                disabled={isPending}
                className="sr-only"
              />
            </label>

            {fileError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {fileError}
              </p>
            )}

            {state && !state.ok && !fileError && (
              <p
                role="alert"
                className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {state.error}
              </p>
            )}

            <footer className="flex justify-end gap-2 pt-2">
              <Dialog.Close
                disabled={isPending}
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
                disabled={isPending || !!fileError}
                className="
                  inline-flex items-center gap-2 rounded-full bg-amber-700
                  px-5 py-2 text-sm font-medium text-white
                  hover:bg-amber-600 disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {isPending ? 'Enviando...' : 'Salvar'}
              </button>
            </footer>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
