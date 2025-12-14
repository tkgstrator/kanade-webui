'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Track = {
  id?: string | number
  type?: string
  attributes?: {
    name: string
    artistName: string
    durationInMillis: number
    trackNumber: number
    discNumber: number
  }
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function TrackListItem({
  track,
  index,
  isSelected,
  onSelect,
}: {
  track: Track
  index: number
  isSelected: boolean
  onSelect: () => void
}) {
  if (!track.attributes) {
    return null
  }

  const { attributes } = track

  return (
    <button
      className={cn(
        'group flex items-center gap-4 rounded-md px-4 py-2 h-12 transition-colors w-full text-left',
        isSelected
          ? 'bg-blue-500 dark:bg-blue-600 text-white'
          : cn(index % 2 === 0 ? 'bg-transparent' : 'bg-muted/40', 'hover:bg-muted'),
      )}
      onClick={onSelect}
      type="button"
    >
      <span
        className={cn(
          'w-6 text-center text-sm tabular-nums self-start mt-1',
          isSelected ? 'text-white' : 'text-muted-foreground',
        )}
      >
        {attributes.trackNumber ?? index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-md', isSelected ? 'text-white' : 'text-foreground')}>{attributes.name}</p>
      </div>
      {attributes.durationInMillis && (
        <span className={cn('text-sm tabular-nums', isSelected ? 'text-white/80' : 'text-muted-foreground')}>
          {formatDuration(attributes.durationInMillis)}
        </span>
      )}
    </button>
  )
}

export function TrackList({ tracks }: { tracks: Track[] }) {
  const [selectedId, setSelectedId] = useState<string | number | null>(null)

  return (
    <div className="flex flex-col w-full">
      {tracks.map((track, index) => (
        <TrackListItem
          index={index}
          isSelected={selectedId === track.id}
          key={track.id ?? index}
          onSelect={() => setSelectedId(track.id ?? null)}
          track={track}
        />
      ))}
    </div>
  )
}
