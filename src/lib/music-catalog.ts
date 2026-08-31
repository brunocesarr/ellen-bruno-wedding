export type MusicTrack = {
  key: string
  title: string
  src: string
}

/**
 * Played whenever no songs have been uploaded via /admin/musicas, or the
 * lookup fails — see getMusicTracks() in get-music-tracks.ts.
 */
export const DEFAULT_MUSIC_TRACK: MusicTrack = {
  key: 'background-song',
  title: 'Nossa música',
  src: '/audio/background-song.mp3',
}
