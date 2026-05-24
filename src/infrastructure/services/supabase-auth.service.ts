import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { InvalidCredentialsError } from '@/src/entities/errors/auth'
import type { AdminUser, SignInInput } from '@/src/entities/models/user'
import { TypedSupabaseClient } from '../supabase/types'

export class SupabaseAuthService implements IAuthService {
  constructor(private readonly client: TypedSupabaseClient) {}

  async signIn(input: SignInInput): Promise<AdminUser> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })
    if (error || !data.user) throw new InvalidCredentialsError()
    return { id: data.user.id, email: data.user.email! }
  }

  async signInWithOtp(email: string, redirectTo: string) {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    })
    if (error) throw error
  }

  async signOut() {
    await this.client.auth.signOut()
  }

  async getCurrentUser(): Promise<AdminUser | null> {
    const {
      data: { user },
    } = await this.client.auth.getUser()
    return user ? { id: user.id, email: user.email! } : null
  }
}
