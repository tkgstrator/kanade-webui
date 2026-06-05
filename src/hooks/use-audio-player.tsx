import { z } from '@hono/zod-openapi'
import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react'

const TrackInfoSchema = z.object({
  artistName: z.string(),
  artworkUrl: z.string(),
  name: z.string(),
  previewUrl: z.string(),
})

export type TrackInfo = z.infer<typeof TrackInfoSchema>

const AudioPlayerStateSchema = z.object({
  currentTrack: TrackInfoSchema.nullable(),
  duration: z.number(),
  isPlaying: z.boolean(),
  progress: z.number(),
})

type AudioPlayerState = z.infer<typeof AudioPlayerStateSchema>

type AudioPlayerAction =
  | { type: 'PLAY'; track: TrackInfo }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'STOP' }
  | { type: 'SET_PROGRESS'; progress: number }
  | { type: 'SET_DURATION'; duration: number }

const initialState: AudioPlayerState = {
  currentTrack: null,
  duration: 0,
  isPlaying: false,
  progress: 0,
}

function reducer(state: AudioPlayerState, action: AudioPlayerAction): AudioPlayerState {
  switch (action.type) {
    case 'PLAY':
      return { ...state, currentTrack: action.track, duration: 0, isPlaying: true, progress: 0 }
    case 'PAUSE':
      return { ...state, isPlaying: false }
    case 'RESUME':
      return { ...state, isPlaying: true }
    case 'STOP':
      return { ...initialState }
    case 'SET_PROGRESS':
      return { ...state, progress: action.progress }
    case 'SET_DURATION':
      return { ...state, duration: action.duration }
    default:
      return state
  }
}

type AudioPlayerContextValue = AudioPlayerState & {
  play: (track: TrackInfo) => void
  pause: () => void
  resume: () => void
  toggle: () => void
  seek: (time: number) => void
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null)

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const play = useCallback((track: TrackInfo) => {
    console.log('[AudioPlayer] play', { artist: track.artistName, name: track.name, url: track.previewUrl })
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
    const audio = new Audio(track.previewUrl)
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      console.debug('[AudioPlayer] loadedmetadata', { duration: audio.duration })
      dispatch({ duration: audio.duration, type: 'SET_DURATION' })
    })

    audio.addEventListener('timeupdate', () => {
      dispatch({ progress: audio.currentTime, type: 'SET_PROGRESS' })
    })

    audio.addEventListener('ended', () => {
      console.debug('[AudioPlayer] ended', { name: track.name })
      dispatch({ type: 'STOP' })
    })

    audio.addEventListener('error', () => {
      console.error('[AudioPlayer] error', { code: audio.error?.code, message: audio.error?.message, name: track.name })
    })

    audio.play()
    dispatch({ track, type: 'PLAY' })
  }, [])

  const pause = useCallback(() => {
    console.debug('[AudioPlayer] pause')
    audioRef.current?.pause()
    dispatch({ type: 'PAUSE' })
  }, [])

  const resume = useCallback(() => {
    console.debug('[AudioPlayer] resume')
    audioRef.current?.play()
    dispatch({ type: 'RESUME' })
  }, [])

  const toggle = useCallback(() => {
    if (state.isPlaying) {
      pause()
    } else if (state.currentTrack) {
      resume()
    }
  }, [state.isPlaying, state.currentTrack, pause, resume])

  const seek = useCallback((time: number) => {
    console.debug('[AudioPlayer] seek', { time })
    if (audioRef.current) {
      audioRef.current.currentTime = time
      dispatch({ progress: time, type: 'SET_PROGRESS' })
    }
  }, [])

  useEffect(() => {
    return () => {
      console.debug('[AudioPlayer] cleanup')
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
      }
    }
  }, [])

  return (
    <AudioPlayerContext.Provider value={{ ...state, pause, play, resume, seek, toggle }}>
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudioPlayer(): AudioPlayerContextValue {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider')
  }
  return context
}
