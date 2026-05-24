type Props = {
  className?: string
  color?: 'terracotta' | 'sage' | 'ocean'
}

export function BrushStroke({ className, color = 'terracotta' }: Props) {
  const fill = `var(--color-${color}-light)`

  return (
    <svg
      viewBox="0 0 200 60"
      aria-hidden
      className={className}
      preserveAspectRatio="none"
    >
      <g fill={fill} opacity="0.6">
        <circle cx="20" cy="30" r="2.5" />
        <circle cx="48" cy="14" r="1.5" />
        <circle cx="60" cy="38" r="2" />
        <circle cx="92" cy="22" r="3" />
        <circle cx="118" cy="44" r="1.8" />
        <circle cx="148" cy="18" r="2.2" />
        <circle cx="172" cy="36" r="2.6" />
        <circle cx="186" cy="10" r="1.4" />
      </g>
    </svg>
  )
}
