import 'server-only'

import { listPublicSiteImagesUseCase } from '@/src/application/use-cases/site-images/list-public-site-images.use-case'
import { getContainer } from '@/src/di/container'
import { resolveStorageUrl } from '@/src/interface-adapters/view-models/_storage'
import { cache } from 'react'
import {
  getFallback,
  getLabel,
  normalizeSiteImageKey,
} from './site-images-catalog'

export type ResolvedSiteImage = {
  src: string
  fallback: string
  alt: string
}

export type ResolvedSiteImageWithKey<K extends string = string> =
  ResolvedSiteImage & {
    key: K
  }

export const getSiteImagesMap = cache(async () => {
  try {
    const c = await getContainer()
    const list = await listPublicSiteImagesUseCase(c)()

    const map = new Map<string, { url: string; alt: string | null }>()

    for (const img of list) {
      const url = resolveStorageUrl(img.imagePath, c.storageRepo)

      if (url) {
        map.set(normalizeSiteImageKey(img.key), {
          url,
          alt: img.alt,
        })
      }
    }

    return map
  } catch (error) {
    console.error('[getSiteImagesMap] failed:', error)
    return new Map<string, { url: string; alt: string | null }>()
  }
})

export async function getSiteImage(key: string): Promise<ResolvedSiteImage> {
  const normalizedKey = normalizeSiteImageKey(key)
  const map = await getSiteImagesMap()

  const fromDb = map.get(normalizedKey)
  const fallback = getFallback(normalizedKey)

  return {
    // Important: never return ""
    src: fromDb?.url || fallback,
    fallback,
    alt: fromDb?.alt || getLabel(normalizedKey),
  }
}

export async function getOrderedSiteImages<
  const TKeys extends readonly string[],
>(keys: TKeys): Promise<Array<ResolvedSiteImageWithKey<TKeys[number]>>> {
  return Promise.all(
    keys.map(async (key) => ({
      key,
      ...(await getSiteImage(key)),
    }))
  )
}
