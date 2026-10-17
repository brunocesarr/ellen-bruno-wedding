/**
 * Fails with a readable message when a required env var is missing, instead of
 * an opaque "Invalid URL" / 401 from deep inside a Supabase client.
 *
 * Pass the value from a LITERAL `process.env.X` access — Next only inlines
 * NEXT_PUBLIC_* vars in client bundles when the access is static, so a dynamic
 * `process.env[name]` lookup here would break them.
 */
export function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Variável de ambiente ausente: ${name}. Veja .env.example.`)
  }
  return value
}
