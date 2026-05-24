'use client'

import { createSupabaseBrowserClient } from '@/src/infrastructure/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AdminTopbar({
  user,
}: {
  user: { email: string; name: string }
}) {
  const router = useRouter()
  async function logout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end gap-3 border-b border-stone-200/40 bg-white/60 px-4 py-3 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3 rounded-full bg-white px-3 py-1.5 shadow-sm">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 font-serif text-sm text-amber-800">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="hidden text-right md:block">
          <p className="text-sm font-medium text-stone-800">{user.name}</p>
          <p className="text-xs text-stone-500">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="ml-1 p-1 text-stone-400 hover:text-stone-700"
          aria-label="Sair"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
