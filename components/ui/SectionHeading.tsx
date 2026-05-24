type Props = {
  eyebrow?: string
  title: string
  accent?: string
  align?: 'center' | 'left'
}

export function SectionHeading({
  eyebrow,
  title,
  accent,
  align = 'center',
}: Props) {
  return (
    <header
      className={`mb-14 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <h2 className="heading-display">{title}</h2>

      {eyebrow && <p className="eyebrow mt-6">{eyebrow}</p>}

      {accent && (
        <p className="accent mt-3">
          <span className="mx-2 inline-block align-middle text-terracotta-light">
            —
          </span>
          {accent}
          <span className="mx-2 inline-block align-middle text-terracotta-light">
            —
          </span>
        </p>
      )}
    </header>
  )
}
