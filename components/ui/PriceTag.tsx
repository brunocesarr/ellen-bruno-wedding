type Props = {
  price: number
  original?: number
  size?: 'sm' | 'md'
  prefix?: string
}

const formatBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(n)

export function PriceTag({ price, original, size = 'md', prefix }: Props) {
  const priceCls = size === 'md' ? 'text-2xl' : 'text-lg'
  return (
    <div className="flex flex-col gap-0.5">
      {prefix && <span className="text-xs text-ink-muted">{prefix}</span>}
      <div className="flex items-baseline gap-2">
        <span
          className={`font-display font-semibold text-terracotta-dark ${priceCls}`}
        >
          {formatBRL(price)}
        </span>
        {original && original > price && (
          <span className="text-sm text-ink-muted line-through">
            {formatBRL(original)}
          </span>
        )}
      </div>
    </div>
  )
}
