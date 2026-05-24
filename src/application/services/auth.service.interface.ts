import type { AdminUser, SignInInput } from '@/src/entities/models/user'

export interface IAuthService {
  signIn(input: SignInInput): Promise<AdminUser>
  signInWithOtp(email: string, redirectTo: string): Promise<void>
  signOut(): Promise<void>
  getCurrentUser(): Promise<AdminUser | null>
}
