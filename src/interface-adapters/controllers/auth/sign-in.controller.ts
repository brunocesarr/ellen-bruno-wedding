import { signInUseCase } from '@/src/application/use-cases/auth/sign-in.use-case'
import { signOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case'
import { getContainer } from '@/src/di/container'
import { InvalidCredentialsError } from '@/src/entities/errors/auth'
import { ValidationError } from '@/src/entities/errors/common'

export async function signInController(input: unknown) {
  const { authService } = await getContainer()
  try {
    const user = await signInUseCase({ authService })(input)
    return { ok: true as const, data: { id: user.id, email: user.email } }
  } catch (e) {
    if (e instanceof InvalidCredentialsError)
      return { ok: false as const, error: e.message }
    if (e instanceof ValidationError)
      return { ok: false as const, error: 'Dados inválidos', issues: e.issues }
    return { ok: false as const, error: 'Erro inesperado' }
  }
}
export async function signOutController() {
  const { authService } = await getContainer()
  await signOutUseCase({ authService })()
  return { ok: true as const }
}
