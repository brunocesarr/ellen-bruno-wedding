export type MusicTrack = {
  key: string
  title: string
  src: string
}

/**
 * Background-music playlist for the public site. MusicToggle shuffles and
 * cycles through whatever is listed here — drop more files into
 * public/audio/ and add an entry below to grow the playlist.
 */
export const MUSIC_CATALOG: MusicTrack[] = [
  {
    key: 'background-song',
    title: 'Nossa música',
    src: '/audio/background-song.mp3',
  },
]
