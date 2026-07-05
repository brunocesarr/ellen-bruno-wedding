'use client'

import { WEDDING_DETAILS } from '@/src/lib/constants'
import {
  ChartBar,
  Gift,
  ImageIcon,
  LayoutDashboard,
  Menu,
  MessageCircleHeart,
  Users,
  X,
} from 'lucide-react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/convidados', label: 'Convidados', icon: Users },
  { href: '/admin/presentes', label: 'Presentes', icon: Gift },
  { href: '/admin/mensagens', label: 'Mensagens', icon: MessageCircleHeart },
  { href: '/admin/resumo', label: 'Resumo', icon: ChartBar },
  { href: '/admin/imagens', label: 'Imagens', icon: ImageIcon },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5 text-stone-700" />
      </button>

      {open && (
        <button
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-stone-900/30 backdrop-blur-sm md:hidden"
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-stone-200/60
        bg-white/70 backdrop-blur-md transition-transform duration-300
        md:sticky md:top-0 md:h-screen md:w-64 md:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        <div className="flex items-center justify-between px-6 py-7">
          <Link
            href="/admin"
            className="font-serif text-2xl italic text-amber-800"
          >
            Ellen <span className="text-amber-600">&</span> Bruno
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-stone-500" />
          </button>
        </div>

        <p className="px-6 pb-4 text-xs uppercase tracking-[0.3em] text-stone-400">
          Painel
        </p>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`
                group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors
                ${
                  active
                    ? 'bg-amber-700 text-white shadow-sm shadow-amber-900/20'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }
              `}
              >
                {active && (
                  <motion.span
                    layoutId="admin-nav-active"
                    className="absolute inset-0 rounded-xl bg-amber-700"
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <footer className="border-t border-stone-200/60 px-6 py-5 text-xs text-stone-400">
          <p>
            {WEDDING_DETAILS.displayDate} · {WEDDING_DETAILS.location.city}
          </p>
          <p className="mt-1">Painel do casal 💛</p>
        </footer>
      </aside>
    </>
  )
}
