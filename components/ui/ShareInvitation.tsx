'use client'

import { toPng } from 'html-to-image'
import { Download, Share2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { InvitationCard } from './InvitationCard'

export function ShareInvitation() {
  const cardRef = useRef<HTMLDivElement>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate(): Promise<File | null> {
    if (!cardRef.current) return null
    const dataUrl = await toPng(cardRef.current, {
      pixelRatio: 2,
      cacheBust: true,
      skipFonts: false,
    })
    const blob = await (await fetch(dataUrl)).blob()
    return new File([blob], 'convite-ellen-bruno.png', { type: 'image/png' })
  }

  async function handleDownload() {
    setLoading(true)
    try {
      const file = await generate()
      if (!file) return
      const url = URL.createObjectURL(file)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  async function handleShare() {
    setLoading(true)
    try {
      const file = await generate()
      if (!file) return
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ellen & Bruno',
          text: 'Você está convidado(a)! 💛',
        })
      } else {
        await handleDownload()
      }
    } catch {
      /* user cancelled */
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 p-6">
      <label className="block">
        <span className="text-sm text-stone-600">Seu nome (opcional)</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Ana Silva"
          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-4 py-2 outline-none focus:border-amber-600"
          maxLength={40}
        />
      </label>

      {/* Live preview (scaled down) */}
      <div className="overflow-hidden rounded-xl border border-stone-200 shadow-sm">
        <div
          style={{
            width: 1080,
            height: 1350,
            transform: 'scale(0.32)',
            transformOrigin: 'top left',
          }}
        >
          <InvitationCard guestName={name || undefined} />
        </div>
        <div style={{ height: 1350 * 0.32 - 1350 }} aria-hidden />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-stone-800 px-5 py-3 text-white transition hover:bg-stone-700 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Baixar
        </button>
        <button
          onClick={handleShare}
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-white transition hover:bg-amber-600 disabled:opacity-50"
        >
          <Share2 className="h-4 w-4" />
          Compartilhar
        </button>
      </div>

      {/* Off-screen full-resolution card used for capture */}
      <div className="pointer-events-none fixed -left-[9999px] top-0">
        <InvitationCard ref={cardRef} guestName={name || undefined} />
      </div>
    </div>
  )
}
