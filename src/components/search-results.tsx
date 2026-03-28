import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type JSX, Suspense } from 'react'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { client } from '@/lib/client'
import { formatDuration, getArtworkUrl } from '@/lib/utils'
import type { AlbumDatum, SongDatum } from '@/schemas/common.dto'

function SongListItem({ song }: { song: SongDatum }) {
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
          <span className="cursor-pointer hover:underline">{attributes.artistName}</span>
          {' • '}
          <span className="cursor-pointer hover:underline">{attributes.albumName}</span>
        </p>
      </div>
      <span className="tabular-nums text-sm text-muted-foreground">{formatDuration(attributes.durationInMillis)}</span>
    </div>
  )
}

function SongList({ songs }: { songs: SongDatum[] }) {
  return (
    <div className="flex flex-col">
      {songs.map((song) => (
        <SongListItem key={song.id} song={song} />
      ))}
    </div>
  )
}

function AlbumListItem({ album }: { album: AlbumDatum }) {
  const { attributes } = album
  return (
    <Link className="group flex flex-col gap-2 rounded-lg" params={{ album_id: Number(album.id) }} to="/albums/$album_id">
      <div className="relative overflow-hidden rounded-md">
        <img
          alt={attributes.name}
          className="aspect-square w-full object-cover shadow-md"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 1024)}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="min-w-0">
        <p className="block truncate text-xs text-foreground group-hover:underline md:text-sm">{attributes.name}</p>
        <p className="block truncate text-xs text-muted-foreground">{attributes.artistName}</p>
        <p className="tabular-nums text-xs text-muted-foreground">
          {attributes.releaseDate ? new Date(attributes.releaseDate).getFullYear() : ''} • {attributes.trackCount}曲
        </p>
      </div>
    </Link>
  )
}

function AlbumList({ albums }: { albums: AlbumDatum[] }) {
  return (
    <>
      {/* モバイル: カルーセル */}
      <div className="-mx-6 md:hidden">
        <Carousel
          opts={{
            align: 'start',
            containScroll: 'trimSnaps',
            loop: true,
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
        className="hidden gap-3 md:grid"
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

function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <Skeleton className="h-8 w-64" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-24" />
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton index key
            <div className="flex flex-col gap-2" key={i}>
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-16" />
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton index key
          <Skeleton className="h-14 w-full rounded-md" key={i} />
        ))}
      </div>
    </div>
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
        queries: { term },
      }),
    queryKey: ['search', term],
  })

  return (
    <div className="flex flex-col gap-8 p-6 select-none">
      <h1 className="text-2xl font-bold text-foreground">「{term}」の検索結果</h1>

      {/* アルバム */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">アルバム</h2>
        <AlbumList albums={(albums?.data?.filter((a) => a.type === 'albums') as AlbumDatum[]) ?? []} />
      </section>

      {/* 曲 */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-foreground">曲</h2>
        <SongList songs={(songs?.data?.filter((s) => s.type === 'songs') as SongDatum[]) ?? []} />
      </section>
    </div>
  )
}

export function SearchResults({ term }: SearchResultsProps) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <Content term={term} />
    </Suspense>
  )
}
