'use client'
import { useState } from 'react'

export function PixQrCode({
  qrImage,
  brCode,
}: {
  qrImage: string
  brCode: string
}) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(brCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrImage}
        alt="QR Code Pix"
        className="mx-auto w-64 rounded-xl border"
      />
      <code className="block break-all rounded bg-slate-100 p-3 text-xs">
        {brCode}
      </code>
      <button onClick={copy} className="btn-secondary w-full">
        {copied ? '✓ Copiado!' : 'Copiar código Pix'}
      </button>
    </div>
  )
}
