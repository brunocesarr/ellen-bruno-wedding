'use client'

import { deleteGiftAction } from '@/app/admin/_actions/gifts.actions'
import { deleteGift } from '@/lib/admin/gifts'
import { GiftViewModel } from '@/src/interface-adapters/view-models/gift.view-model'
import { Gift as GiftIcon, Pencil, Search, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useState, useTransition } from 'react'
import { EmptyState } from './EmptyState'
import { GiftFormDialog } from './GiftFormDialog'
import { StatusPill } from './StatusPill'

export function GiftsTable({ gifts }: { gifts: GiftViewModel[] }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'reserved' | 'pending'
  >('all')
  const [, startTransition] = useTransition()

  const filtered = useMemo(() => {
    return gifts.filter((g) => {
      const matchQ =
        !query || g.name.toLowerCase().includes(query.toLowerCase())
      const matchS = statusFilter === 'all' || g.status === 'reserved'
      return matchQ && matchS
    })
  }, [gifts, query, statusFilter])

  if (!gifts.length) {
    return (
      <EmptyState
        icon={<GiftIcon className="h-4 w-4" />}
        title="Nenhum presente cadastrado"
        description="Comecem adicionando os itens que farão parte da lista do site."
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            placeholder="Buscar por nome..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-full border border-stone-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-amber-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as typeof statusFilter)
          }
          className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm outline-none focus:border-amber-600"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="reserved">Reservado</option>
          <option value="thanked">Agradecido</option>
        </select>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wider text-stone-400">
              <th className="px-4 py-3 font-medium">Presente</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Reservado por</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filtered.map((g) => (
              <tr key={g.id} className="transition-colors hover:bg-stone-50/60">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-stone-100">
                      {g.imageUrl && (
                        <Image
                          src={g.imageUrl}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-stone-800">{g.name}</p>
                      {g.description && (
                        <p className="line-clamp-1 text-xs text-stone-500">
                          {g.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {g.category ?? '—'}
                </td>
                <td className="px-4 py-3 font-medium tabular-nums text-stone-800">
                  R$ {(g.price ?? 0).toLocaleString('pt-BR')}
                </td>
                <td className="px-4 py-3 text-stone-600">
                  {g.reservedBy ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={g.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <GiftFormDialog
                      gift={g}
                      trigger={
                        <button
                          className="rounded-lg p-2 text-stone-500 hover:bg-stone-100"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      }
                    />
                    <button
                      onClick={() => {
                        if (!confirm(`Remover "${g.name}"?`)) return
                        startTransition(() => {
                          deleteGiftAction(g.id)
                        })
                      }}
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((g) => (
          <article
            key={g.id}
            className="rounded-xl border border-stone-200 bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-stone-100">
                {g.imageUrl && (
                  <Image
                    src={g.imageUrl}
                    alt=""
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-stone-800">{g.name}</p>
                  <StatusPill status={g.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-amber-700">
                  R$ {(g.price ?? 0).toLocaleString('pt-BR')}
                </p>
                {g.reservedBy && (
                  <p className="mt-1 text-xs text-stone-500">
                    por {g.reservedBy}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <GiftFormDialog
                gift={g}
                trigger={
                  <button className="inline-flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-sm text-stone-700">
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                }
              />
              <button
                onClick={() => {
                  if (!confirm(`Remover "${g.name}"?`)) return
                  startTransition(() => {
                    deleteGift(g.id)
                  })
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-1.5 text-sm text-rose-700"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
