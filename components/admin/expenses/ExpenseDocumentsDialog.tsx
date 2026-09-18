'use client'

import {
  deleteExpenseDocumentAction,
  uploadExpenseDocumentAction,
} from '@/app/admin/_actions/expense-documents.actions'
import { DialogShell } from '@/components/ui/DialogShell'
import type { ExpenseDocumentKind } from '@/src/entities/models/expense-document'
import type { ExpenseDocumentViewModel } from '@/src/interface-adapters/view-models/expense-document.view-model'
import type { ExpenseViewModel } from '@/src/interface-adapters/view-models/expense.view-model'
import {
  EXPENSE_DOCUMENT_ACCEPTED_TYPES,
  MAX_EXPENSE_DOCUMENT_ORIGINAL_BYTES,
  MAX_EXPENSE_DOCUMENT_STORED_BYTES,
} from '@/src/lib/constants'
import * as Dialog from '@radix-ui/react-dialog'
import imageCompression from 'browser-image-compression'
import { Loader2, Paperclip, Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { ExpenseDocumentChip } from './ExpenseDocumentChip'

const ACCEPTED_TYPES: readonly string[] = EXPENSE_DOCUMENT_ACCEPTED_TYPES
const ACCEPT = ACCEPTED_TYPES.join(',')

/**
 * Mirrors the server-side pass in `document-upload.ts`, one step tighter so the
 * bytes that travel are already the bytes that get stored. Running it here is
 * what keeps a 12 MB phone photo of a contract from ever hitting the 5 MB
 * Server Action body limit.
 */
async function prepare(file: File): Promise<File> {
  if (file.type === 'application/pdf') return file

  const blob = await imageCompression(file, {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    initialQuality: 0.72,
    fileType: 'image/webp',
  })

  const baseName = file.name.replace(/\.[^/.]+$/, '').trim() || 'documento'
  return new File([blob], `${baseName}.webp`, {
    type: 'image/webp',
    lastModified: Date.now(),
  })
}

type Slot = {
  kind: ExpenseDocumentKind
  installmentId: string | null
}

const slotId = (s: Slot) => `${s.kind}:${s.installmentId ?? 'expense'}`

function UploadSlot({
  slot,
  label,
  busy,
  onPick,
}: {
  slot: Slot
  label: string
  busy: boolean
  onPick: (slot: Slot, file: File) => void
}) {
  return (
    <label
      className={`
        inline-flex cursor-pointer items-center gap-1.5 rounded-full border
        border-dashed border-stone-300 px-2.5 py-1 text-xs text-stone-500
        transition hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-800
        ${busy ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Plus className="h-3.5 w-3.5" />
      )}
      {busy ? 'Enviando...' : label}
      <input
        type="file"
        accept={ACCEPT}
        disabled={busy}
        className="sr-only"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0]
          // Reset so re-picking the same file still fires a change event.
          e.currentTarget.value = ''
          if (file) onPick(slot, file)
        }}
      />
    </label>
  )
}

function DocumentList({
  documents,
  removingId,
  onRemove,
  empty,
}: {
  documents: ExpenseDocumentViewModel[]
  removingId: string | null
  onRemove: (id: string) => void
  empty: string
}) {
  if (documents.length === 0) {
    return <span className="text-xs text-stone-400">{empty}</span>
  }

  return (
    <>
      {documents.map((d) => (
        <ExpenseDocumentChip
          key={d.id}
          doc={d}
          removing={removingId === d.id}
          onRemove={() => onRemove(d.id)}
        />
      ))}
    </>
  )
}

/**
 * Uploads run one file at a time against the action directly rather than
 * through `useActionState`: this panel has an upload slot per parcela, and a
 * single action state could not say *which* slot is in flight. `ExpensesTable`
 * already drives its delete the same way.
 */
export function ExpenseDocumentsDialog({
  expense,
  trigger,
}: {
  expense: ExpenseViewModel
  trigger: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busySlot, setBusySlot] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, startTransition] = useTransition()

  /**
   * Covers the whole round-trip, not just the action: `router.refresh()` runs
   * in a transition afterwards, and without `isRefreshing` the panel would drop
   * back to idle while it still showed the pre-write counts and chips.
   */
  const isBusy = Boolean(busySlot || removingId || isRefreshing)
  const busyLabel = busySlot
    ? 'Enviando documento...'
    : removingId
      ? 'Removendo documento...'
      : 'Atualizando...'

  const handlePick = useCallback(
    async (slot: Slot, file: File) => {
      setError(null)

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Formato inválido. Use PDF, JPG, PNG ou WEBP.')
        return
      }

      const isPdf = file.type === 'application/pdf'
      const limit = isPdf
        ? MAX_EXPENSE_DOCUMENT_STORED_BYTES
        : MAX_EXPENSE_DOCUMENT_ORIGINAL_BYTES

      if (file.size > limit) {
        setError(
          isPdf
            ? 'PDF muito grande. Envie um arquivo de até 4 MB.'
            : 'Imagem muito grande. Envie uma imagem de até 20 MB.'
        )
        return
      }

      setBusySlot(slotId(slot))

      let payload: File
      try {
        payload = await prepare(file)
      } catch (e) {
        console.error('Failed to compress document:', e)
        setBusySlot(null)
        setError('Não foi possível comprimir a imagem. Tente outro arquivo.')
        return
      }

      const formData = new FormData()
      formData.set('expenseId', expense.id)
      formData.set('kind', slot.kind)
      if (slot.installmentId) formData.set('installmentId', slot.installmentId)
      formData.set('file', payload)

      const result = await uploadExpenseDocumentAction(null, formData)
      setBusySlot(null)

      if (!result?.ok) {
        setError(result?.error ?? 'Não foi possível enviar o documento.')
        return
      }

      startTransition(() => router.refresh())
    },
    [expense.id, router]
  )

  const handleRemove = useCallback(
    async (id: string) => {
      setError(null)
      setRemovingId(id)

      const result = await deleteExpenseDocumentAction(id)
      setRemovingId(null)

      if (!result.ok) {
        setError(result.error)
        return
      }

      startTransition(() => router.refresh())
    },
    [router]
  )

  function handleOpenChange(next: boolean) {
    if (isBusy) return
    setOpen(next)
    if (!next) setError(null)
  }

  return (
    <DialogShell
      trigger={trigger}
      open={open}
      onOpenChange={handleOpenChange}
      contentClassName="flex max-h-[92vh] w-[94vw] max-w-2xl flex-col"
    >
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-5 py-4 md:px-6">
        <div className="min-w-0">
          <Dialog.Title className="truncate font-serif text-xl text-stone-900">
            Documentos
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-stone-500">
            {expense.description} · {expense.documentCount} arquivo(s) ·{' '}
            {expense.documentsSizeLabel}
          </Dialog.Description>
        </div>

        <Dialog.Close
          disabled={isBusy}
          className="rounded-full p-1 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </Dialog.Close>
      </header>

      {/* The overlay is a sibling of the scroller, not a child: inside it, an
          absolutely-positioned element scrolls away with the content. */}
      <div className="relative min-h-0 flex-1">
        <div
          className="h-full space-y-5 overflow-y-auto p-5 md:p-6"
          /* Blocks the keyboard too — the overlay alone only stops the mouse,
             and every upload slot is a focusable <input type="file">. */
          inert={isBusy}
        >
          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
              Contrato assinado
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <DocumentList
                documents={expense.contracts}
                removingId={removingId}
                onRemove={handleRemove}
                empty="Nenhum contrato anexado."
              />
              <UploadSlot
                slot={{ kind: 'contract', installmentId: null }}
                label={
                  expense.contracts.length ? 'Adicionar' : 'Anexar contrato'
                }
                busy={busySlot === 'contract:expense'}
                onPick={handlePick}
              />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
              Comprovantes por parcela
            </h3>

            <div className="divide-y divide-stone-100 rounded-xl border border-stone-200">
              {expense.installments.map((i, index) => (
                <div key={i.id} className="space-y-2 p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs">
                    <span className="font-medium text-stone-700">
                      Parcela {index + 1} · {i.dueDateLabel}
                    </span>
                    <span className="tabular-nums text-stone-500">
                      {i.paidAmountLabel} de {i.amountLabel}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <DocumentList
                      documents={i.documents}
                      removingId={removingId}
                      onRemove={handleRemove}
                      empty="Sem comprovante."
                    />
                    <UploadSlot
                      slot={{ kind: 'payment_proof', installmentId: i.id }}
                      label="Anexar comprovante"
                      busy={busySlot === `payment_proof:${i.id}`}
                      onPick={handlePick}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
              Outros comprovantes
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <DocumentList
                documents={expense.looseProofs}
                removingId={removingId}
                onRemove={handleRemove}
                empty="Nenhum comprovante avulso."
              />
              <UploadSlot
                slot={{ kind: 'payment_proof', installmentId: null }}
                label="Anexar avulso"
                busy={busySlot === 'payment_proof:expense'}
                onPick={handlePick}
              />
            </div>
          </section>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <p className="flex items-start gap-1.5 text-xs text-stone-400">
            <Paperclip className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
            PDF de até 4 MB, ou imagem de até 20 MB — imagens são comprimidas
            automaticamente antes do envio. Os arquivos ficam em um bucket
            privado e só abrem por link temporário.
          </p>
        </div>

        {isBusy && (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-0 grid cursor-wait place-items-center bg-white/70 backdrop-blur-[1px] transition-opacity duration-150"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-stone-600 shadow-sm ring-1 ring-stone-200">
              <Loader2 className="h-4 w-4 animate-spin text-amber-700" />
              {busyLabel}
            </span>
          </div>
        )}
      </div>
    </DialogShell>
  )
}
