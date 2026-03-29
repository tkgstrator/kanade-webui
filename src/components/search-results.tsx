import { useSuspenseQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { Pause, Play } from 'lucide-react'
import { motion } from 'motion/react'
import { type JSX, Suspense } from 'react'
import { Equalizer } from '@/components/equalizer'
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import { client } from '@/lib/client'
import { cn, extractAlbumIdFromUrl, formatDuration, getArtworkUrl } from '@/lib/utils'
import type { AlbumDatum, SongDatum } from '@/schemas/common.dto'

function SongListItem({ index, song }: { index: number; song: SongDatum }) {
  const { attributes } = song
  const albumId = extractAlbumIdFromUrl(attributes.url)
  const { currentTrack, isPlaying, play, toggle } = useAudioPlayer()
  const previewUrl = attributes.previews?.[0]?.url
  const isCurrentTrack = currentTrack?.previewUrl === previewUrl && previewUrl !== undefined
  const isCurrentlyPlaying = isCurrentTrack && isPlaying

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!previewUrl) return
    if (isCurrentTrack) {
      toggle()
    } else {
      play({
        artistName: attributes.artistName,
        artworkUrl: getArtworkUrl(attributes.artwork.url, 256),
        name: attributes.name,
        previewUrl,
      })
    }
  }

  return (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 rounded-md p-2"
      initial={{ opacity: 0, x: -16 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <button className="relative shrink-0 cursor-pointer" onClick={handlePlay} type="button">
        <img
          alt={attributes.name}
          className="size-12 rounded-md object-cover shadow-sm"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 256)}
        />
        <div className={cn(
          'absolute inset-0 flex items-center justify-center rounded-md transition-colors',
          isCurrentlyPlaying ? 'bg-black/30' : 'bg-black/0 hover:bg-black/30',
        )}>
          {isCurrentlyPlaying ? (
            <Pause className="size-5 text-white" fill="white" />
          ) : (
            <Play className={cn('size-5 text-white transition-opacity', isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 hover:opacity-100')} fill="white" />
          )}
        </div>
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn('flex items-center gap-1.5 truncate font-medium', isCurrentTrack ? 'text-red-500' : 'text-foreground')}>
          {isCurrentlyPlaying && <Equalizer className="size-3.5 shrink-0" />}
          <span className="truncate">{attributes.name}</span>
        </p>
        <p className="truncate text-sm text-muted-foreground">
          <span className="cursor-pointer hover:underline">{attributes.artistName}</span>
          {' \u2022 '}
          {albumId ? (
            <Link
              className="hover:text-foreground hover:underline"
              params={{ album_id: albumId }}
              to="/albums/$album_id"
            >
              {attributes.albumName}
            </Link>
          ) : (
            <span>{attributes.albumName}</span>
          )}
        </p>
      </div>
      <span className="tabular-nums text-sm text-muted-foreground">{formatDuration(attributes.durationInMillis)}</span>
    </motion.div>
  )
}

function SongList({ songs }: { songs: SongDatum[] }) {
  return (
    <div className="flex flex-col">
      {songs.map((song, index) => (
        <SongListItem index={index} key={song.id} song={song} />
      ))}
    </div>
  )
}

function AlbumListItem({ album }: { album: AlbumDatum }) {
  const { attributes } = album
  return (
    <Link className="group flex flex-col gap-2 rounded-lg" params={{ album_id: Number(album.id) }} to="/albums/$album_id">
      <motion.div
        className="relative overflow-hidden rounded-md"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <img
          alt={attributes.name}
          className="aspect-square w-full object-cover shadow-md"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 1024)}
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </motion.div>
      <div className="min-w-0">
        <p className="block truncate text-xs text-foreground group-hover:underline md:text-sm">{attributes.name}</p>
        <p className="block truncate text-xs text-muted-foreground">{attributes.artistName}</p>
        <p className="tabular-nums text-xs text-muted-foreground">
          {attributes.releaseDate ? dayjs(attributes.releaseDate).format('YYYY') : ''} • {attributes.trackCount}曲
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

const Content = ({ term }: { term: string }): JSX.Element => {
  const {
    data: {
      results: { albums, songs },
    },
  } = useSuspenseQuery({
    queryFn: async () => {
      console.log('[Search] fetching', { term })
      const data = await client.get('/api/search', {
        queries: { term },
      })
      console.log('[Search] fetched', {
        albums: data.results.albums?.data.length ?? 0,
        songs: data.results.songs?.data.length ?? 0,
        term,
      })
      return data
    },
    queryKey: ['search', term],
  })

  return (
    <div className="flex flex-col gap-8 p-6 select-none">
      <motion.h1
        className="text-2xl font-bold text-foreground"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        「{term}」の検索結果
      </motion.h1>

      {/* アルバム */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">アルバム</h2>
        <AlbumList albums={albums?.data?.filter((a): a is AlbumDatum => a.type === 'albums') ?? []} />
      </motion.section>

      {/* 曲 */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-foreground">曲</h2>
        <SongList songs={songs?.data?.filter((s): s is SongDatum => s.type === 'songs') ?? []} />
      </motion.section>
    </div>
  )
}

export function SearchResults({ term }: { term: string }) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <Content term={term} />
    </Suspense>
  )
}
