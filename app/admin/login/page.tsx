'use client'

import { RomanticLoader } from '@/components/ui/RomanticLoader'
import { createSupabaseBrowserClient } from '@/src/infrastructure/supabase/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Informe um email válido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
})
type FormValues = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/admin'

  const [serverError, setServerError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: FormValues) {
    setServerError(null)
    const supabase = createSupabaseBrowserClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (error) {
      setServerError('Email ou senha inválidos')
      return
    }

    setAuthenticated(true)

    setTimeout(() => {
      router.replace(next)
      router.refresh()
    }, 900)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cream-50 to-cream-100 px-4">
      <AnimatePresence>
        {authenticated && (
          <RomanticLoader
            message="Bem-vindos de volta 💛"
            submessage="Preparando o painel..."
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl border border-stone-200/70 bg-white/80 p-8 shadow-sm backdrop-blur-md md:p-10"
      >
        <header className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-stone-400">
            Painel
          </p>
          <h1 className="mt-2 font-serif text-3xl italic text-amber-800">
            Ellen <span className="text-amber-600">&</span> Bruno
          </h1>
          <p className="mt-3 text-sm text-stone-500">
            Acesso restrito ao casal
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-600">
              Email
            </span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="email@exemplo.com"
                aria-invalid={!!errors.email}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                  errors.email
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-stone-300 focus:border-amber-600'
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <span className="mt-1 block text-xs text-rose-600">
                {errors.email.message}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-600">
              Senha
            </span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500'
                    : 'border-stone-300 focus:border-amber-600'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="mt-1 block text-xs text-rose-600">
                {errors.password.message}
              </span>
            )}
          </label>

          {serverError && (
            <div
              role="alert"
              className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-700"
            >
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-700 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
