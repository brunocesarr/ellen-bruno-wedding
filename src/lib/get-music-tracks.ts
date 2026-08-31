import 'server-only'

import { listPublicSongsUseCase } from '@/src/application/use-cases/songs/list-public-songs.use-case'
import { getPublicContainer } from '@/src/di/public-container'
import { resolveStorageUrl } from '@/src/interface-adapters/view-models/_storage'
import { cache } from 'react'
import { DEFAULT_MUSIC_TRACK, type MusicTrack } from './music-catalog'

function isDynamicServerUsageError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'digest' in error &&
    error.digest === 'DYNAMIC_SERVER_USAGE'
  )
}

export const getMusicTracks = cache(async (): Promise<MusicTrack[]> => {
  try {
    const container = getPublicContainer()
    const songs = await listPublicSongsUseCase(container)()

    if (songs.length === 0) return [DEFAULT_MUSIC_TRACK]

    const tracks = songs
      .map((song) => {
        const src = resolveStorageUrl(
          song.audioPath,
          container.audioStorageRepo
        )
        return src ? { key: song.id, title: song.title, src } : null
      })
      .filter((t): t is MusicTrack => t !== null)

    return tracks.length > 0 ? tracks : [DEFAULT_MUSIC_TRACK]
  } catch (error) {
    if (isDynamicServerUsageError(error)) throw error

    console.error('[getMusicTracks] failed:', error)
    return [DEFAULT_MUSIC_TRACK]
  }
})
