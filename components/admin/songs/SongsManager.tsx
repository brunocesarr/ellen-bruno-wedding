'use client'

import {
  deleteSongAction,
  reorderSongsAction,
} from '@/app/admin/_actions/songs.actions'
import type { SongViewModel } from '@/src/interface-adapters/view-models/song.view-model'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, useTransition } from 'react'
import { AddSongDialog } from './AddSongDialog'

type Props = { songs: SongViewModel[] }

export function SongsManager({ songs }: Props) {
  const [items, setItems] = useState(songs)
  const [renderedSongs, setRenderedSongs] = useState(songs)
  const [isPending, startTransition] = useTransition()
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null
  )

  if (songs !== renderedSongs) {
    setRenderedSongs(songs)
    setItems(songs)
  }

  function move(index: number, direction: -1 | 1) {
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= items.length) return

    const next = [...items]
    const temp = next[index]!
    next[index] = next[targetIndex]!
    next[targetIndex] = temp
    setItems(next)

    startTransition(async () => {
      await reorderSongsAction(next.map((s) => s.id))
    })
  }

  function handleDelete(id: string) {
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id)
      setTimeout(() => setConfirmingDeleteId(null), 3000)
      return
    }
    startTransition(async () => {
      await deleteSongAction(id)
      setConfirmingDeleteId(null)
    })
  }

  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
          Nenhuma música enviada — tocando a música padrão do site.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((song, index) => (
            <motion.li
              key={song.id}
              layout
              className="flex flex-col gap-3 rounded-xl border border-stone-200/70 bg-white p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <p
                className="min-w-0 flex-1 truncate font-medium text-stone-900"
                title={song.title}
              >
                {song.title}
              </p>

              {song.audioUrl && (
                <audio
                  controls
                  preload="none"
                  src={song.audioUrl}
                  className="h-9 w-full sm:w-64"
                />
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={isPending || index === 0}
                  aria-label="Mover para cima"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={isPending || index === items.length - 1}
                  aria-label="Mover para baixo"
                  className="flex h-8 w-8 items-center justify-center rounded-full text-stone-500 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(song.id)}
                  disabled={isPending}
                  aria-label={
                    confirmingDeleteId === song.id
                      ? 'Confirmar remoção'
                      : 'Remover música'
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    confirmingDeleteId === song.id
                      ? 'bg-rose-600 text-white hover:bg-rose-500'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  } disabled:opacity-50`}
                >
                  <Trash2 className="h-3 w-3" />
                  {confirmingDeleteId === song.id ? 'Confirmar' : ''}
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}

      <AddSongDialog />
    </div>
  )
}
