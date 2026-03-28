import { useState } from 'react'
import { cn, formatDuration } from '@/lib/utils'
import type { CatalogAlbumDatum } from '@/schemas/common.dto'

type SongDatum = Extract<
  NonNullable<NonNullable<CatalogAlbumDatum['relationships']>['tracks']>['data'][number],
  { type: 'songs' }
>

function TrackListItem({
  track,
  index,
  isSelected,
  onSelect,
}: {
  track: SongDatum
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  const { attributes } = track

  return (
    <button
      className={cn(
        'group flex h-12 w-full items-center gap-4 rounded-md px-4 py-2 text-left transition-colors',
        isSelected
          ? 'bg-blue-500 text-white dark:bg-blue-600'
          : cn(index % 2 === 0 ? 'bg-transparent' : 'bg-muted/40', 'hover:bg-muted'),
      )}
      onClick={onSelect}
      type="button"
    >
      <span
        className={cn(
          'mt-1 w-6 self-start text-center text-sm tabular-nums',
          isSelected ? 'text-white' : 'text-muted-foreground',
        )}
      >
        {attributes.trackNumber ?? index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-md', isSelected ? 'text-white' : 'text-foreground')}>{attributes.name}</p>
      </div>
      {attributes.durationInMillis && (
        <span className={cn('tabular-nums text-sm', isSelected ? 'text-white/80' : 'text-muted-foreground')}>
          {formatDuration(attributes.durationInMillis)}
        </span>
      )}
    </button>
  )
}

export function TrackList({ tracks }: { tracks: SongDatum[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  return (
    <div className="flex w-full flex-col">
      {tracks.map((track, index) => (
        <TrackListItem
          index={index}
          isSelected={selectedId === track.id}
          key={track.id}
          onSelect={() => setSelectedId(track.id)}
          track={track}
        />
      ))}
    </div>
  )
}
