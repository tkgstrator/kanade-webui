'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type JSX, Suspense } from 'react'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { type AlbumsDatum, client } from '@/lib/client'

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getArtworkUrl(url: string, size: number): string {
  return url.replace('{w}', size.toString()).replace('{h}', size.toString())
}

function SongListItem({ song }: { song: AlbumsDatum }) {
  const { attributes } = song
  return (
    <div className="flex items-center gap-3 rounded-md p-2">
      <img
        alt={attributes.name}
        className="size-12 rounded-md object-cover shadow-sm"
        draggable={false}
        src={getArtworkUrl(attributes.artwork.url, 256)}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{attributes.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          <span className="hover:underline cursor-pointer">{attributes.artistName}</span>
          {' • '}
          <span className="hover:underline cursor-pointer">{attributes.albumName}</span>
        </p>
      </div>
      <span className="text-sm text-muted-foreground tabular-nums">{formatDuration(attributes.durationInMillis)}</span>
    </div>
  )
}

function SongList({ songs }: { songs: AlbumsDatum[] }) {
  return (
    <div className="flex flex-col">
      {songs.map((song) => (
        <SongListItem key={song.id} song={song} />
      ))}
    </div>
  )
}

function AlbumListItem({ album }: { album: AlbumsDatum }) {
  const { attributes } = album
  return (
    <div className="flex flex-col gap-2 rounded-lg">
      <Link
        className="group relative block overflow-hidden rounded-md"
        params={{ album_id: album.id }}
        to="/albums/$album_id"
      >
        <img
          alt={attributes.name}
          className="aspect-square w-full object-cover shadow-md"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 1024)}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
      <div className="min-w-0">
        <Link
          className="block truncate text-xs md:text-sm text-foreground hover:underline"
          params={{ album_id: album.id }}
          to="/albums/$album_id"
        >
          {attributes.name}
        </Link>
        <div className="block truncate text-xs text-muted-foreground">{attributes.artistName}</div>
        <p className="text-xs text-muted-foreground tabular-nums">
          {attributes.releaseDate.split('-')[0]} • {attributes.trackCount}曲
        </p>
      </div>
    </div>
  )
}

function AlbumList({ albums }: { albums: AlbumsDatum[] }) {
  return (
    <>
      {/* モバイル: カルーセル */}
      <div className="md:hidden -mx-6">
        <Carousel
          opts={{
            align: 'start',
            containScroll: 'trimSnaps',
            loop: true,
            // dragFree: true,
            skipSnaps: true,
          }}
        >
          <CarouselContent className="ml-6">
            {albums.map((album) => (
              <CarouselItem className="basis-36 pl-3" key={album.id}>
                <AlbumListItem album={album} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      {/* デスクトップ: グリッド */}
      <div
        className="hidden md:grid gap-3"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(max(144px, calc((100% - 5 * 0.75rem) / 6)), 1fr))',
        }}
      >
        {albums.map((album) => (
          <AlbumListItem album={album} key={album.id} />
        ))}
      </div>
    </>
  )
}

type SearchResultsProps = {
  term: string
}

const Content = ({ term }: SearchResultsProps): JSX.Element => {
  const {
    data: {
      results: { albums, songs },
    },
  } = useSuspenseQuery({
    queryFn: async () =>
      client.get('/api/search', {
        queries: { term: term },
      }),
    queryKey: ['search', term],
  })
  return (
    <div className="flex flex-col gap-8 p-6 select-none">
      <h1 className="text-2xl font-bold text-foreground">「{term}」の検索結果</h1>

      {/* アルバム */}
      <section>
        {' '}
        <h2 className="mb-4 text-lg font-semibold text-foreground">アルバム</h2>
        <AlbumList albums={albums?.data ?? []} />
      </section>
      {/* 曲 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">曲</h2>
        <SongList songs={songs?.data ?? []} />
      </section>
    </div>
  )
}

export function SearchResults({ term }: SearchResultsProps) {
  return (
    <Suspense>
      <Content term={term} />
    </Suspense>
  )
}
