import { z } from '@hono/zod-openapi'
import type { ReactNode } from 'react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from 'react'

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
  isPlaying: false,
  progress: 0,
  duration: 0,
}

function reducer(state: AudioPlayerState, action: AudioPlayerAction): AudioPlayerState {
  switch (action.type) {
    case 'PLAY':
      return { ...state, currentTrack: action.track, isPlaying: true, progress: 0, duration: 0 }
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
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      audioRef.current.load()
    }
    const audio = new Audio(track.previewUrl)
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      dispatch({ type: 'SET_DURATION', duration: audio.duration })
    })

    audio.addEventListener('timeupdate', () => {
      dispatch({ type: 'SET_PROGRESS', progress: audio.currentTime })
    })

    audio.addEventListener('ended', () => {
      dispatch({ type: 'STOP' })
    })

    audio.play()
    dispatch({ type: 'PLAY', track })
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    dispatch({ type: 'PAUSE' })
  }, [])

  const resume = useCallback(() => {
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
    if (audioRef.current) {
      audioRef.current.currentTime = time
      dispatch({ type: 'SET_PROGRESS', progress: time })
    }
  }, [])

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.removeAttribute('src')
        audioRef.current.load()
      }
    }
  }, [])

  return (
    <AudioPlayerContext.Provider value={{ ...state, play, pause, resume, toggle, seek }}>
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
