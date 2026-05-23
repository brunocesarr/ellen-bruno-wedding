import { signOutAction } from '@/app/admin/_actions/auth.actions'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <nav className="flex items-center justify-between border-b bg-white p-4">
        <div className="flex gap-6">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/rsvp">Confirmações</Link>
          <Link href="/admin/gifts">Presentes</Link>
        </div>
        <form action={signOutAction}>
          <button className="text-sm text-slate-600 hover:underline">
            Sair
          </button>
        </form>
      </nav>
      <div className="p-6">{children}</div>
    </div>
  )
}
