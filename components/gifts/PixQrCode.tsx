'use client'

import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Check, Copy } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

export function PixQrCode({
  qrImage,
  brCode,
}: {
  qrImage: string
  brCode: string
}) {
  const { isCopied, copy } = useCopyToClipboard()
  const copied = isCopied(brCode)

  return (
    <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm md:p-8">
      <div className="flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImage}
          alt="QR Code Pix"
          className="size-56 rounded-xl border border-ink/10 md:size-64"
        />
      </div>

      <div className="space-y-2">
        <span className="eyebrow">Pix copia e cola</span>
        <code className="block break-all rounded-lg bg-cream-dark p-3 text-xs leading-relaxed text-ink">
          {brCode}
        </code>
      </div>

      <button onClick={() => copy(brCode)} className="btn-primary w-full">
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="copied"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2"
            >
              <Check className="size-4" /> Código copiado!
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="flex items-center gap-2"
            >
              <Copy className="size-4" /> Copiar código Pix
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  )
}
