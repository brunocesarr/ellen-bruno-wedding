import type { IAuthService } from '@/src/application/services/auth.service.interface'

export function signOutUseCase(deps: { authService: IAuthService }) {
  return async () => deps.authService.signOut()
}
