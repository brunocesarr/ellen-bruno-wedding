'use client'

import { AnimatedTabs } from '@/components/admin/AnimatedTabs'
import { SiteImageCard } from '@/components/admin/site-images/SiteImageCard'
import type { SiteImageViewModel } from '@/src/interface-adapters/view-models/site-image.view-model'
import {
  SECTION_LABELS,
  SITE_IMAGE_CATALOG,
  type SiteImageDef,
  type SiteImageSection,
} from '@/src/lib/site-images-catalog'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'

type Props = { stored: SiteImageViewModel[] }

export function SiteImagesGrid({ stored }: Props) {
  const storedByKey = useMemo(
    () => new Map(stored.map((s) => [s.key, s])),
    [stored]
  )

  const sections = useMemo(() => {
    const map = new Map<SiteImageSection, SiteImageDef[]>()
    for (const item of SITE_IMAGE_CATALOG) {
      const arr = map.get(item.section) ?? []
      arr.push(item)
      map.set(item.section, arr)
    }
    return Array.from(map.entries())
  }, [])

  const tabs = useMemo(
    () => [
      { id: 'all', label: 'Todas', count: SITE_IMAGE_CATALOG.length },
      ...sections.map(([section, items]) => ({
        id: section,
        label: SECTION_LABELS[section],
        count: items.length,
      })),
    ],
    [sections]
  )

  const [tab, setTab] = useState<string>('all')

  const visible = useMemo(() => {
    if (tab === 'all') return SITE_IMAGE_CATALOG
    return SITE_IMAGE_CATALOG.filter((c) => c.section === tab)
  }, [tab])

  return (
    <div className="space-y-6">
      <AnimatedTabs
        tabs={tabs}
        value={tab}
        onChange={setTab}
        variant="pills"
        ariaLabel="Filtrar imagens por seção"
      />

      <motion.div
        layout
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {visible.map((def, i) => (
          <SiteImageCard
            key={def.key}
            def={def}
            stored={storedByKey.get(def.key) ?? null}
            index={i}
          />
        ))}
      </motion.div>
    </div>
  )
}
