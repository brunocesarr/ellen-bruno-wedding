'use client'

import { markAsThankedAction } from '@/app/admin/_actions/messages.actions'
import { type GuestMessage } from '@/lib/admin/messages'
import { formatRelativeTime } from '@/lib/format'
import { MessageViewModel } from '@/src/interface-adapters/view-models/message.view-model'
import {
  CheckCircle2,
  Gift as GiftIcon,
  MessageCircleHeart,
  Quote,
} from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import { useTransition } from 'react'
import { EmptyState } from './EmptyState'

export function MessagesGrid({ messages }: { messages: MessageViewModel[] }) {
  if (!messages.length) {
    return (
      <EmptyState
        icon={<MessageCircleHeart className="h-4 w-4" />}
        title="Sem mensagens ainda"
        description="As mensagens dos convidados aparecerão aqui."
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {messages.map((m, i) => (
        <MessageItem key={m.id} message={m} index={i} />
      ))}
    </div>
  )
}

function MessageItem({
  message,
  index,
}: {
  message: GuestMessage
  index: number
}) {
  const [pending, startTransition] = useTransition()

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.04 }}
      className="relative flex flex-col gap-4 rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-amber-50/40 p-5 shadow-sm transition hover:shadow-md"
    >
      <Quote
        className="absolute right-4 top-4 h-7 w-7 text-amber-200"
        aria-hidden
      />

      <header className="flex items-center gap-3 pr-8">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-amber-100 font-serif text-amber-800">
          {message.guestName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-stone-900">
            {message.guestName}
          </p>
          <p className="text-xs text-stone-400">
            {formatRelativeTime(message.createdAt)}
          </p>
        </div>
      </header>

      <blockquote className="font-serif text-base italic leading-relaxed text-stone-700">
        "{message.message}"
      </blockquote>

      {message.gift && (
        <div className="flex items-center gap-3 rounded-xl border border-stone-100 bg-white p-3">
          {message.gift.imageUrl && (
            <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-stone-100">
              <Image
                src={message.gift.imageUrl}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 text-xs text-stone-500">
              <GiftIcon className="h-3 w-3" /> Presente
            </p>
            <p className="truncate text-sm font-medium text-stone-800">
              {message.gift.name}
            </p>
          </div>
          {message.gift.price && (
            <p className="text-sm font-medium tabular-nums text-amber-700">
              R$ {message.gift.price.toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      )}

      <footer>
        {message.thanked ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" /> Agradecido
          </span>
        ) : (
          <button
            onClick={() =>
              startTransition(() => {
                markAsThankedAction(message.id)
              })
            }
            disabled={pending}
            className="text-xs font-medium text-amber-700 hover:text-amber-800 disabled:opacity-50"
          >
            Marcar como agradecido →
          </button>
        )}
      </footer>
    </motion.article>
  )
}
