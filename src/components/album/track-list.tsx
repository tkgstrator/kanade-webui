import { Play } from 'lucide-react'
import { motion } from 'motion/react'
import { Equalizer } from '@/components/equalizer'

import { useAudioPlayer } from '@/hooks/use-audio-player'
import { cn, formatDuration, getArtworkUrl } from '@/lib/utils'
import type { CatalogAlbumDatum } from '@/schemas/common.dto'

type SongDatum = Extract<
  NonNullable<NonNullable<CatalogAlbumDatum['relationships']>['tracks']>['data'][number],
  { type: 'songs' }
>

function TrackListItem({
  albumArtworkUrl,
  albumArtistName,
  index,
  track,
}: {
  albumArtworkUrl?: string
  albumArtistName?: string
  index: number
  track: SongDatum
}) {
  const { attributes } = track
  const { currentTrack, isPlaying, play, toggle } = useAudioPlayer()
  const previewUrl = attributes.previews?.[0]?.url
  const isCurrentTrack = currentTrack?.previewUrl === previewUrl && previewUrl !== undefined
  const isCurrentlyPlaying = isCurrentTrack && isPlaying

  const handlePlay = () => {
    if (!previewUrl) return
    if (isCurrentTrack) {
      toggle()
    } else {
      play({
        artistName: attributes.artistName ?? albumArtistName ?? '',
        artworkUrl: albumArtworkUrl
          ? getArtworkUrl(albumArtworkUrl, 256)
          : getArtworkUrl(attributes.artwork.url, 256),
        name: attributes.name,
        previewUrl,
      })
    }
  }

  return (
    <button
      className={cn(
        'group flex h-12 w-full items-center gap-4 rounded-md px-4 py-2 text-left transition-colors',
        index % 2 === 0 ? 'bg-transparent' : 'bg-muted/40',
        previewUrl ? 'cursor-pointer' : 'cursor-default',
        'hover:bg-muted',
      )}
      onClick={handlePlay}
      type="button"
    >
      <span className={cn(
        'w-6 text-center text-sm tabular-nums',
        isCurrentTrack ? 'text-red-500' : 'text-muted-foreground',
      )}>
        {isCurrentlyPlaying ? (
          <Equalizer className="mx-auto size-4" />
        ) : previewUrl ? (
          <>
            <span className="group-hover:hidden">{attributes.trackNumber ?? index + 1}</span>
            <Play className="mx-auto hidden size-4 group-hover:block" fill="currentColor" />
          </>
        ) : (
          attributes.trackNumber ?? index + 1
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-md', isCurrentTrack ? 'text-red-500' : 'text-foreground')}>
          {attributes.name}
        </p>
      </div>
      {attributes.durationInMillis && (
        <span className="tabular-nums text-sm text-muted-foreground">
          {formatDuration(attributes.durationInMillis)}
        </span>
      )}
    </button>
  )
}

export function TrackList({
  albumArtistName,
  albumArtworkUrl,
  tracks,
}: {
  albumArtistName?: string
  albumArtworkUrl?: string
  tracks: SongDatum[]
}) {
  return (
    <div className="flex w-full flex-col">
      {tracks.map((track, index) => (
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          initial={{ opacity: 0, x: -16 }}
          key={track.id}
          transition={{ delay: index * 0.03, duration: 0.25 }}
        >
          <TrackListItem
            albumArtistName={albumArtistName}
            albumArtworkUrl={albumArtworkUrl}
            index={index}
            track={track}
          />
        </motion.div>
      ))}
    </div>
  )
}
