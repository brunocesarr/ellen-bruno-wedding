import { listRsvpsController } from '@/src/interface-adapters/controllers/rsvp/list-rsvps.controller'
import { redirect } from 'next/navigation'

export default async function AdminRsvpPage() {
  const result = await listRsvpsController()
  if (!result.ok) redirect('/admin/login')

  return (
    <main className="mx-auto max-w-6xl">
      <h1 className="mb-6 font-serif text-3xl">
        Confirmações ({result.data.length})
      </h1>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th>E-mail</th>
              <th>Comparece?</th>
              <th>Acompanhantes</th>
              <th>Mensagem</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.fullName}</td>
                <td>{r.email ?? '—'}</td>
                <td>{r.attending ? '✅' : '❌'}</td>
                <td>{r.companions}</td>
                <td className="max-w-xs truncate">{r.message ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
