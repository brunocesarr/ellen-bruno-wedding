'use client'

import type { MusicTrack } from '@/src/lib/music-catalog'
import { SkipForward, Volume2, VolumeX } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'wedding:music-on'
const TARGET_VOLUME = 0.35
const FADE_MS = 800

function readStoredPreference(): 'on' | 'off' | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === '1') return 'on'
    if (raw === '0') return 'off'
    return null
  } catch {
    return null
  }
}

function saveMusicPreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

/** Fisher–Yates shuffle of catalog indices — a fresh listening order per visit. */
function shuffledIndices(length: number): number[] {
  const indices = Array.from({ length }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = indices[i]!
    indices[i] = indices[j]!
    indices[j] = temp
  }
  return indices
}

type Props = {
  tracks: MusicTrack[]
}

export function MusicToggle({ tracks }: Props) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin') ?? false

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const orderRef = useRef<number[]>([])
  const posRef = useRef(0)
  const hasInitializedRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearInterval(fadeTimer.current)
    }
  }, [])

  const fadeTo = useCallback((target: number, onDone?: () => void) => {
    const audio = audioRef.current
    if (!audio) return

    if (fadeTimer.current) clearInterval(fadeTimer.current)

    const steps = 20
    const stepMs = FADE_MS / steps
    const delta = (target - audio.volume) / steps
    let step = 0

    fadeTimer.current = setInterval(() => {
      const currentAudio = audioRef.current
      if (!currentAudio) return

      step += 1
      currentAudio.volume = Math.max(
        0,
        Math.min(1, currentAudio.volume + delta)
      )

      if (step >= steps) {
        if (fadeTimer.current) {
          clearInterval(fadeTimer.current)
          fadeTimer.current = null
        }
        currentAudio.volume = target
        onDone?.()
      }
    }, stepMs)
  }, [])

  /** Loads whatever track `posRef` currently points at into the element. */
  const loadCurrentTrack = useCallback(() => {
    const audio = audioRef.current
    const index = orderRef.current[posRef.current]
    const track = index !== undefined ? tracks[index] : undefined
    if (!audio || !track) return
    audio.src = track.src
    audio.load()
  }, [tracks])

  const advanceTrack = useCallback(() => {
    posRef.current += 1
    if (posRef.current >= orderRef.current.length) {
      orderRef.current = shuffledIndices(tracks.length)
      posRef.current = 0
    }
    loadCurrentTrack()
  }, [loadCurrentTrack, tracks])

  const attemptPlay = useCallback(async (): Promise<boolean> => {
    const audio = audioRef.current
    if (!audio) return false

    audio.volume = 0
    try {
      await audio.play()
      fadeTo(TARGET_VOLUME)
      saveMusicPreference(true)
      return true
    } catch {
      return false
    }
  }, [fadeTo])

  const skip = useCallback(() => {
    advanceTrack()
    attemptPlay()
  }, [advanceTrack, attemptPlay])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      await attemptPlay()
      return
    }

    fadeTo(0, () => {
      audio.pause()
      saveMusicPreference(false)
    })
  }, [attemptPlay, fadeTo])

  // Autoplay on arrival at a public route; pause (without touching the saved
  // preference) whenever the visitor is inside the admin panel, and resume
  // seamlessly on the way back out.
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isAdminRoute) {
      if (!audio.paused) fadeTo(0, () => audio.pause())
      return
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      orderRef.current = shuffledIndices(tracks.length)
      posRef.current = 0
      loadCurrentTrack()
    }

    if (readStoredPreference() === 'off') return
    if (!audio.paused) return

    let disposed = false

    const onGesture = () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
      if (!disposed) attemptPlay()
    }

    // Browsers may block unmuted autoplay without a prior user gesture on
    // this page; fall back to starting on the visitor's first interaction.
    attemptPlay().then((started) => {
      if (!started && !disposed) {
        window.addEventListener('pointerdown', onGesture)
        window.addEventListener('keydown', onGesture)
      }
    })

    return () => {
      disposed = true
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('keydown', onGesture)
    }
  }, [isAdminRoute, attemptPlay, fadeTo, loadCurrentTrack, tracks])

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={advanceTrack}
      />

      {!isAdminRoute && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2"
        >
          <motion.button
            type="button"
            onClick={toggle}
            aria-label={
              isPlaying ? 'Pausar música do casal' : 'Tocar música do casal'
            }
            aria-pressed={isPlaying}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/30 p-2 text-stone-700 shadow-lg backdrop-blur-md transition-colors hover:bg-white/50"
          >
            <motion.span
              animate={isPlaying && !reduce ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="flex"
            >
              {isPlaying ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </motion.span>
          </motion.button>

          {tracks.length > 1 && (
            <motion.button
              type="button"
              onClick={skip}
              aria-label="Pular para a próxima música"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/30 p-2 text-stone-700 shadow-lg backdrop-blur-md transition-colors hover:bg-white/50"
            >
              <SkipForward className="h-5 w-5" />
            </motion.button>
          )}
        </motion.div>
      )}
    </>
  )
}
