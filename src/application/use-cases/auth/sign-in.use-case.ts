import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { ValidationError } from '@/src/entities/errors/common'
import { SignInInputSchema } from '@/src/entities/models/user'

export function signInUseCase(deps: { authService: IAuthService }) {
  return async (raw: unknown) => {
    const result = SignInInputSchema.safeParse(raw)
    if (!result.success) throw new ValidationError(result.error.flatten())
    return deps.authService.signIn(result.data)
  }
}
