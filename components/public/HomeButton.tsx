import { ArrowLeft, Home } from 'lucide-react'
import Link from 'next/link'

type HomeButtonProps = {
  href?: string
  label?: string
  className?: string
}

export function HomeButton({
  href = '/',
  label = 'Voltar ao início',
  className = '',
}: HomeButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={`
      fixed left-4 top-4 z-50
      inline-flex items-center gap-2
      rounded-full border border-white/50
      bg-white/75 px-4 py-2
      text-xs font-medium uppercase tracking-[0.18em]
      text-amber-800 shadow-md backdrop-blur-md
      transition-all duration-300
      hover:-translate-y-0.5 hover:bg-white hover:shadow-lg
      focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-700
      md:left-6 md:top-6 md:px-5 md:py-2.5
      ${className}
    `}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      <Home className="h-4 w-4 sm:hidden" />
    </Link>
  )
}
