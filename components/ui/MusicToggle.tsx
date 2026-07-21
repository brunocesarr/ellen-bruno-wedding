'use client'

import { Music, Volume2, VolumeX } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

const STORAGE_KEY = 'wedding:music-on'
const STORAGE_CHANGE_EVENT = 'wedding:music-change'
const TARGET_VOLUME = 0.35
const FADE_MS = 800

function subscribeToMusicPreference(callback: () => void) {
  window.addEventListener('storage', callback)
  window.addEventListener(STORAGE_CHANGE_EVENT, callback)

  return () => {
    window.removeEventListener('storage', callback)
    window.removeEventListener(STORAGE_CHANGE_EVENT, callback)
  }
}

function getMusicPreferenceSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function getMusicPreferenceServerSnapshot() {
  return false
}

function saveMusicPreference(enabled: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0')
    window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT))
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function MusicToggle({
  src = '/audio/background-song.mp3',
}: {
  src?: string
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [interactedThisSession, setInteractedThisSession] = useState(false)

  const wasPreviouslyEnabled = useSyncExternalStore(
    subscribeToMusicPreference,
    getMusicPreferenceSnapshot,
    getMusicPreferenceServerSnapshot
  )

  const hasInteracted = interactedThisSession || wasPreviouslyEnabled
  const reduce = useReducedMotion()

  useEffect(() => {
    return () => {
      if (fadeTimer.current) {
        clearInterval(fadeTimer.current)
      }
    }
  }, [])

  const fadeTo = useCallback((target: number, onDone?: () => void) => {
    const audio = audioRef.current

    if (!audio) return

    if (fadeTimer.current) {
      clearInterval(fadeTimer.current)
    }

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

  const toggle = useCallback(async () => {
    const audio = audioRef.current

    if (!audio) return

    setInteractedThisSession(true)

    if (audio.paused) {
      audio.volume = 0

      try {
        await audio.play()
        fadeTo(TARGET_VOLUME)
        setIsPlaying(true)
        saveMusicPreference(true)
      } catch {
        setIsPlaying(false)
        saveMusicPreference(false)
      }

      return
    }

    fadeTo(0, () => {
      audio.pause()
      setIsPlaying(false)
      saveMusicPreference(false)
    })
  }, [fadeTo])

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="none" />

      <motion.button
        type="button"
        onClick={toggle}
        aria-label={
          isPlaying ? 'Pausar música do casal' : 'Tocar música do casal'
        }
        aria-pressed={isPlaying}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="fixed bottom-6 left-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/30 p-2 text-stone-700 shadow-lg backdrop-blur-md transition-colors hover:bg-white/50"
      >
        <motion.span
          animate={isPlaying && !reduce ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="flex"
        >
          {!hasInteracted ? (
            <Music className="h-5 w-5" />
          ) : isPlaying ? (
            <Volume2 className="h-5 w-5" />
          ) : (
            <VolumeX className="h-5 w-5" />
          )}
        </motion.span>
      </motion.button>
    </>
  )
}
