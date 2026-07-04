import { listSiteImagesAction } from '@/app/admin/_actions/site-images.actions'
import { SectionCard } from '@/components/admin/SectionCard'
import { SiteImagesGrid } from '@/components/admin/site-images/SiteImagesGrid'
import { unwrapForPage } from '@/src/lib/server-action-result'

export const dynamic = 'force-dynamic'

export default async function SiteImagesPage() {
  const images = unwrapForPage(await listSiteImagesAction())

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-stone-900 md:text-4xl">
          Imagens do site
        </h1>
        <p className="mt-1 text-stone-500">
          Gerenciem as fotos exibidas no convite. Sem upload? Usamos a foto
          padrão.
        </p>
      </header>

      <SectionCard
        title="Galeria gerenciada"
        description="Cliquem em uma imagem para substituir ou remover"
      >
        <SiteImagesGrid stored={images} />
      </SectionCard>
    </div>
  )
}
