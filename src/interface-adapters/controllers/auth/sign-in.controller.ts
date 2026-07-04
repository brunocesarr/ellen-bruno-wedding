import { signInUseCase } from '@/src/application/use-cases/auth/sign-in.use-case'
import { signOutUseCase } from '@/src/application/use-cases/auth/sign-out.use-case'
import { getContainer } from '@/src/di/container'
import { handle } from '../_handle'

export async function signInController(input: unknown) {
  const { authService } = await getContainer()
  return handle(async () => {
    const user = await signInUseCase({ authService })(input)
    return { id: user.id, email: user.email }
  })
}

export async function signOutController() {
  const { authService } = await getContainer()
  await signOutUseCase({ authService })()
  return { ok: true as const }
}
