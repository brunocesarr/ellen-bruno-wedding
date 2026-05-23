import Link from 'next/link'
import { EnvelopeIcon } from './EnvelopeIcon' // Extracted SVG

export function InviteLink() {
  return (
    <Link
      href="/invite"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-ivory shadow-lg transition-all hover:scale-110 hover:bg-terracotta-dark"
      aria-label="Abrir convite digital"
    >
      <EnvelopeIcon />
    </Link>
  )
}
