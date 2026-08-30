'use client'

import { clearRsvpRequestsHistoryAction } from '@/app/admin/_actions/rsvp-requests.actions'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function ClearRsvpHistoryButton({ count }: { count: number }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (count === 0) return null

  const close = () => {
    if (pending) return
    setOpen(false)
    setError(null)
  }

  const confirm = () => {
    setError(null)
    startTransition(async () => {
      const res = await clearRsvpRequestsHistoryAction()
      if (!res.ok) return setError(res.error)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Limpar histórico
      </button>

      <ConfirmDialog
        open={open}
        onOpenChange={(next) => !next && close()}
        tone="danger"
        pending={pending}
        error={error}
        title="Limpar histórico de solicitações?"
        description={
          <>
            As <strong className="text-stone-800">{count}</strong> solicitações
            já aprovadas ou recusadas serão apagadas permanentemente. Convidados
            já criados não são afetados. Solicitações ainda aguardando resposta
            não serão removidas. Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Limpar histórico"
        pendingLabel="Limpando..."
        cancelLabel="Cancelar"
        onConfirm={confirm}
      />
    </>
  )
}
