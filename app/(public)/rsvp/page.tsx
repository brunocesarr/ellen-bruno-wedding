import { RsvpForm } from '@/components/rsvp/RsvpForm'

export const metadata = { title: 'Confirmação de presença · Ellen & Bruno' }

export default function RsvpPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-3xl font-serif">Confirme sua presença</h1>
      <p className="mb-8 text-slate-600">
        Sua resposta nos ajuda a organizar tudo com carinho 💕
      </p>
      <RsvpForm />
    </main>
  )
}
