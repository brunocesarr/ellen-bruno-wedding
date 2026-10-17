import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      id="main"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <p className="eyebrow text-sage">Erro 404</p>
      <h1 className="font-display text-4xl text-terracotta">
        Página não encontrada
      </h1>
      <p className="max-w-md text-ink-muted">
        Não encontramos o que você procurava. O link pode ter expirado ou estar
        incorreto.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-full bg-terracotta px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
      >
        Voltar ao início
      </Link>
    </main>
  )
}
