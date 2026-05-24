import 'server-only'

import { listPublicSiteImagesUseCase } from '@/src/application/use-cases/site-images/list-public-site-images.use-case'
import { getPublicContainer } from '@/src/di/public-container'
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

function isDynamicServerUsageError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    error.digest === 'DYNAMIC_SERVER_USAGE'
  )
}

export const getSiteImagesMap = cache(async () => {
  try {
    const container = getPublicContainer()
    const list = await listPublicSiteImagesUseCase(container)()

    const map = new Map<string, { url: string; alt: string | null }>()

    for (const img of list) {
      const url = resolveStorageUrl(img.imagePath, container.storageRepo)

      if (url) {
        map.set(normalizeSiteImageKey(img.key), {
          url,
          alt: img.alt,
        })
      }
    }

    return map
  } catch (error) {
    // Do not swallow Next dynamic-rendering internal errors.
    // If this ever happens again, the import boundary is wrong.
    if (isDynamicServerUsageError(error)) {
      throw error
    }

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
