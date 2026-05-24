import { LoginForm } from '@/components/admin/login/LoginForm'
import { createSupabaseServerClient } from '@/src/infrastructure/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If already logged in, send them to the dashboard
  if (user) redirect('/admin')

  return (
    <main className="grid min-h-screen place-items-center bg-stone-50 p-6">
      <LoginForm />
    </main>
  )
}
