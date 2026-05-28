import { GiftViewModel } from '@/src/interface-adapters/view-models/gift.view-model'
import { GiftCard } from './GiftCard'

type Props = { gifts: GiftViewModel[]; token?: string }

export function GiftGrid({ gifts, token }: Props) {
  if (gifts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="font-display text-3xl text-terracotta">
          Nada por aqui ainda
        </div>
        <p className="max-w-md text-ink-muted">
          Estamos preparando a lista com muito carinho. Volte em breve! 💕
        </p>
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-1 gap-4 py-8 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {gifts.map((gift) => (
        <li key={gift.id}>
          <GiftCard gift={gift} token={token} />
        </li>
      ))}
    </ul>
  )
}
