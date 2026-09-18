'use client'

import { getExpenseDocumentUrlAction } from '@/app/admin/_actions/expense-documents.actions'
import { DialogShell } from '@/components/ui/DialogShell'
import type { ExpenseDocumentViewModel } from '@/src/interface-adapters/view-models/expense-document.view-model'
import * as Dialog from '@radix-ui/react-dialog'
import { ExternalLink, FileText, ImageIcon, Loader2, X } from 'lucide-react'
import { useState } from 'react'

const KIND_TONE = {
  contract: 'bg-indigo-50 text-indigo-700 ring-indigo-200 hover:bg-indigo-100',
  payment_proof:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100',
} as const

/**
 * The compact representation of a stored document: an icon, the file name and
 * its size, on one line. Nothing is fetched until it is clicked — the bytes sit
 * in a private bucket, so opening one costs a signed URL, and pre-fetching every
 * chip on the page would spend storage requests on links nobody opened.
 */
export function ExpenseDocumentChip({
  doc,
  onRemove,
  removing = false,
}: {
  doc: ExpenseDocumentViewModel
  onRemove?: () => void
  removing?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const Icon = doc.isPdf ? FileText : ImageIcon

  async function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) return

    // Signed URLs expire, so each open mints a fresh one rather than reusing
    // whatever this component happened to fetch earlier in the session.
    setUrl(null)
    setError(null)
    setLoading(true)

    const result = await getExpenseDocumentUrlAction(doc.id)
    setLoading(false)

    if (result.ok) setUrl(result.data.url)
    else setError(result.error)
  }

  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1">
      <DialogShell
        open={open}
        onOpenChange={handleOpenChange}
        contentClassName="flex max-h-[92vh] w-[94vw] max-w-4xl flex-col"
        trigger={
          <button
            type="button"
            // The panel-wide overlay says *something* is happening; dimming the
            // one chip says which file, and disabling it stops the viewer being
            // opened on a document that is mid-delete.
            disabled={removing}
            title={`${doc.kindLabel} · ${doc.fileName} · ${doc.sizeLabel}`}
            className={`inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ring-1 transition ${KIND_TONE[doc.kind]} ${removing ? 'cursor-wait opacity-50' : ''}`}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{doc.fileName}</span>
            <span className="flex-shrink-0 tabular-nums opacity-60">
              {doc.sizeLabel}
            </span>
          </button>
        }
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
          <div className="min-w-0">
            <Dialog.Title className="truncate font-serif text-lg text-stone-900">
              {doc.fileName}
            </Dialog.Title>
            <Dialog.Description className="text-xs text-stone-500">
              {doc.kindLabel} · {doc.sizeLabel} · enviado em{' '}
              {doc.uploadedAtLabel}
            </Dialog.Description>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
                aria-label="Abrir em nova aba"
                title="Abrir em nova aba"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <Dialog.Close
              className="rounded-full p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-auto bg-stone-50 p-4">
          {loading && (
            <div className="grid h-64 place-items-center text-stone-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          {url &&
            (doc.isPdf ? (
              <iframe
                src={url}
                title={doc.fileName}
                className="h-[70vh] w-full rounded-xl border border-stone-200 bg-white"
              />
            ) : (
              /* Deliberately a plain <img>: the source is a short-lived signed
                 URL on a private bucket, which next/image can neither cache nor
                 re-sign once it expires. */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={url}
                alt={doc.fileName}
                className="mx-auto max-h-[70vh] w-auto rounded-xl bg-white object-contain shadow-sm"
              />
            ))}
        </div>
      </DialogShell>

      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          aria-label={`Remover ${doc.fileName}`}
          title="Remover"
          className="flex-shrink-0 rounded-full p-1 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {removing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </button>
      )}
    </span>
  )
}
