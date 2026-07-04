import type { AdminUser, SignInInput } from '@/src/entities/models/user'

export interface IAuthService {
  signIn(input: SignInInput): Promise<AdminUser>
  signOut(): Promise<void>
  getCurrentUser(): Promise<AdminUser | null>
}
