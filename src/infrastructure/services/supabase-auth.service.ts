import type { IAuthService } from '@/src/application/services/auth.service.interface'
import { InvalidCredentialsError } from '@/src/entities/errors/auth'
import type { AdminUser, SignInInput } from '@/src/entities/models/user'
import type { SupabaseClient } from '@supabase/supabase-js'

export class SupabaseAuthService implements IAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async signIn(input: SignInInput): Promise<AdminUser> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    })
    if (error || !data.user) throw new InvalidCredentialsError()
    return { id: data.user.id, email: data.user.email! }
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
