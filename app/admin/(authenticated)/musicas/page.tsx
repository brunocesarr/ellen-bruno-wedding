import { listSongsAction } from '@/app/admin/_actions/songs.actions'
import { SectionCard } from '@/components/admin/SectionCard'
import { SongsManager } from '@/components/admin/songs/SongsManager'
import { unwrapForPage } from '@/src/lib/server-action-result'

export const dynamic = 'force-dynamic'

export default async function SongsPage() {
  const songs = unwrapForPage(await listSongsAction())

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
          Músicas
        </h1>
        <p className="mt-1 text-stone-500">
          Gerenciem a playlist tocada no site. Sem upload? Usamos a música
          padrão.
        </p>
      </header>

      <SectionCard
        title="Playlist do casamento"
        description="Adicionem, reordenem ou removam músicas"
      >
        <SongsManager songs={songs} />
      </SectionCard>
    </div>
  )
}
