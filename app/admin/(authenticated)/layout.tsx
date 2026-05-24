import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { NavigationProgressBar } from '@/components/admin/NavigationProgressBar'
import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login') // safe now: login is OUTSIDE this layout
  }

  return (
    <div className="admin-shell min-h-screen text-stone-800">
      <div className="mx-auto flex max-w-[1600px]">
        <AdminSidebar />
        <NavigationProgressBar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar
            user={{
              email: user.email ?? '',
              name: user.user_metadata?.name ?? 'Casal',
            }}
          />
          <main className="min-w-0 flex-1 px-4 pb-16 pt-6 md:px-8 md:pt-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
