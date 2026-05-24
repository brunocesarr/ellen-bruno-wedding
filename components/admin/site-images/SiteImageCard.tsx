'use client'

import { clearSiteImageAction } from '@/app/admin/_actions/site-images.actions'
import { SmartImage } from '@/components/ui/SmartImage'
import type { SiteImageViewModel } from '@/src/interface-adapters/view-models/site-image.view-model'
import type { SiteImageDef } from '@/src/lib/site-images-catalog'
import { AlertCircle, CheckCircle2, Pencil, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, useTransition } from 'react'
import { SiteImageUploadDialog } from './SiteImageUploadDialog'

type Props = {
  def: SiteImageDef
  stored: SiteImageViewModel | null
  index: number
}

export function SiteImageCard({ def, stored, index }: Props) {
  const [isPending, startTransition] = useTransition()
  const [confirmingClear, setConfirmingClear] = useState(false)

  const isUsingDb = !!stored?.imageUrl
  const previewSrc = stored?.imageUrl ?? def.fallback
  const aspectClass =
    def.aspect === 'square'
      ? 'aspect-square'
      : def.aspect === 'landscape'
        ? 'aspect-[4/3]'
        : 'aspect-[3/4]'

  function handleClear() {
    if (!confirmingClear) {
      setConfirmingClear(true)
      setTimeout(() => setConfirmingClear(false), 3000)
      return
    }
    startTransition(async () => {
      await clearSiteImageAction(def.key)
      setConfirmingClear(false)
    })
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.04 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/70 bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Preview */}
      <div className={`relative ${aspectClass} bg-stone-100`}>
        {previewSrc ? (
          <SmartImage
            src={previewSrc}
            fallback={def.fallback} // 👈 always have the local fallback ready
            alt={stored?.alt ?? def.label}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-stone-300">
            <AlertCircle className="h-8 w-8" />
          </div>
        )}

        {/* Source badge */}
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ring-1 backdrop-blur ${
            isUsingDb
              ? 'bg-emerald-50/90 text-emerald-700 ring-emerald-200'
              : 'bg-stone-50/90 text-stone-600 ring-stone-200'
          }`}
        >
          {isUsingDb ? (
            <>
              <CheckCircle2 className="h-3 w-3" /> Personalizada
            </>
          ) : (
            <>Padrão</>
          )}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-medium text-stone-900">{def.label}</p>
          <p className="mt-0.5 truncate text-xs text-stone-400" title={def.key}>
            {def.key}
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2">
          <SiteImageUploadDialog
            def={def}
            stored={stored}
            trigger={
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-amber-700 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-600"
              >
                <Pencil className="h-3 w-3" />
                {isUsingDb ? 'Substituir' : 'Adicionar'}
              </button>
            }
          />

          {isUsingDb && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                confirmingClear
                  ? 'bg-rose-600 text-white hover:bg-rose-500'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              } disabled:opacity-50`}
              aria-label={
                confirmingClear ? 'Confirmar remoção' : 'Remover imagem'
              }
            >
              <Trash2 className="h-3 w-3" />
              {confirmingClear ? 'Confirmar' : ''}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  )
}
