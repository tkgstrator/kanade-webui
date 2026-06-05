import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Pause, Play, RefreshCw, Search } from 'lucide-react'
import { motion } from 'motion/react'
import { Suspense, useState } from 'react'
import { Equalizer } from '@/components/equalizer'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { useAudioPlayer } from '@/hooks/use-audio-player'
import { useVersionCheck } from '@/hooks/use-version-check'
import { client } from '@/lib/client'
import { cn, extractAlbumIdFromUrl, getArtworkUrl } from '@/lib/utils'
import type { ChartAlbumDatum, ChartMusicVideoDatum, ChartPlaylistDatum, ChartSongDatum } from '@/schemas/common.dto'

export const Route = createFileRoute('/')({
  component: Page,
  errorComponent: ({ error, reset }) => (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-xl font-bold text-foreground">エラーが発生しました</h2>
      <pre className="max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-sm text-muted-foreground">
        {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
      </pre>
      <button
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        onClick={reset}
        type="button"
      >
        <RefreshCw className="size-4" />
        再試行
      </button>
    </div>
  ),
})

const chartsQueryOptions = {
  queryFn: async () => {
    console.log('[Charts] fetching')
    const data = await client.get('/api/charts', {
      queries: { limit: 25, types: ['albums', 'music-videos', 'playlists', 'songs'] as const },
    })
    console.log('[Charts] fetched', {
      albums: data.results.albums?.[0]?.data.length ?? 0,
      playlists: data.results.playlists?.[0]?.data.length ?? 0,
      songs: data.results.songs?.[0]?.data.length ?? 0,
    })
    return data
  },
  queryKey: ['charts'] as const,
  staleTime: 1000 * 60 * 30,
}

function useCharts() {
  return useSuspenseQuery(chartsQueryOptions)
}

function HeroAlbumCard({ album }: { album: ChartAlbumDatum }) {
  const { attributes } = album
  const bgColor = attributes.artwork.bgColor ? `#${attributes.artwork.bgColor}` : '#1a1a2e'
  const textColor1 = attributes.artwork.textColor1 ? `#${attributes.artwork.textColor1}` : '#ffffff'
  const textColor2 = attributes.artwork.textColor2 ? `#${attributes.artwork.textColor2}` : '#ffffffcc'

  return (
    <Link
      className="group relative flex aspect-21/9 w-full overflow-hidden rounded-2xl"
      params={{ album_id: Number(album.id) }}
      to="/albums/$album_id"
    >
      <div className="absolute inset-0" style={{ backgroundColor: bgColor }}>
        <div className="absolute inset-0 bg-linear-to-r from-black/40 via-transparent to-transparent" />
      </div>
      <div className="relative flex h-full w-full items-end gap-4 p-4 md:items-center md:p-5">
        <motion.img
          alt={attributes.name}
          className="aspect-square h-3/4 rounded-xl object-cover shadow-2xl"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 600)}
          transition={{ damping: 20, stiffness: 300, type: 'spring' }}
          whileHover={{ scale: 1.03 }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: textColor2 }}>
            トップアルバム
          </p>
          <h2 className="line-clamp-2 text-base font-bold leading-tight md:text-lg" style={{ color: textColor1 }}>
            {attributes.name}
          </h2>
          <p className="truncate text-xs" style={{ color: textColor2 }}>
            {attributes.artistName}
          </p>
        </div>
      </div>
    </Link>
  )
}

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Skeleton className="aspect-21/9 w-full rounded-2xl" />
      <Skeleton className="hidden aspect-21/9 w-full rounded-2xl md:block" />
      <Skeleton className="hidden aspect-21/9 w-full rounded-2xl xl:block" />
    </div>
  )
}

function HeroSection() {
  const { data } = useCharts()

  const albums = data.results.albums?.[0]?.data ?? []
  const featured = albums.slice(0, 3)
  if (featured.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {featured.map((album, index) => (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className={cn(index === 1 && 'hidden md:block', index === 2 && 'hidden xl:block')}
          initial={{ opacity: 0, y: 16 }}
          key={album.id}
          transition={{ delay: index * 0.1, duration: 0.4 }}
        >
          <HeroAlbumCard album={album} />
        </motion.div>
      ))}
    </div>
  )
}

function ScrollableRow({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="px-1 text-xl font-bold text-foreground">{title}</h2>
      <Carousel
        opts={{
          align: 'start',
          containScroll: 'trimSnaps',
          dragFree: true,
          skipSnaps: true,
        }}
      >
        <CarouselContent className="-ml-3">{children}</CarouselContent>
        <CarouselPrevious className="hidden md:inline-flex -left-3 size-8 border-none bg-black/40 text-white backdrop-blur-sm hover:bg-black/60" />
        <CarouselNext className="hidden md:inline-flex -right-3 size-8 border-none bg-black/40 text-white backdrop-blur-sm hover:bg-black/60" />
      </Carousel>
    </motion.section>
  )
}

function AlbumCard({ album, index }: { album: ChartAlbumDatum; index: number }) {
  const { attributes } = album
  return (
    <CarouselItem className="basis-36 pl-3 md:basis-44">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 16 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
      >
        <Link className="group flex flex-col gap-2" params={{ album_id: Number(album.id) }} to="/albums/$album_id">
          <motion.div
            className="relative overflow-hidden rounded-xl shadow-md"
            transition={{ damping: 20, stiffness: 300, type: 'spring' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              alt={attributes.name}
              className="aspect-square w-full object-cover"
              draggable={false}
              src={getArtworkUrl(attributes.artwork.url, 400)}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </motion.div>
          <div className="flex flex-col gap-0.5 px-0.5">
            <span className="truncate text-sm font-medium text-foreground">{attributes.name}</span>
            <span className="truncate text-xs text-muted-foreground">{attributes.artistName}</span>
          </div>
        </Link>
      </motion.div>
    </CarouselItem>
  )
}

function SongCard({ index, song }: { index: number; song: ChartSongDatum }) {
  const { attributes } = song
  const albumId = extractAlbumIdFromUrl(attributes.url)
  const { currentTrack, isPlaying, play, toggle } = useAudioPlayer()
  const previews = attributes.previews
  const previewUrl = previews?.[0]?.url
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

  const inner = (
    <motion.div
      animate={{ opacity: 1, x: 0 }}
      className="group flex min-w-0 items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/60"
      initial={{ opacity: 0, x: -12 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
    >
      <button className="relative shrink-0 cursor-pointer" onClick={handlePlay} type="button">
        <img
          alt={attributes.name}
          className="size-12 rounded-lg object-cover shadow-sm"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 256)}
        />
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center rounded-lg transition-colors',
            isCurrentlyPlaying ? 'bg-black/30' : 'bg-black/0 group-hover:bg-black/30',
          )}
        >
          {isCurrentlyPlaying ? (
            <Pause className="size-5 text-white" fill="white" />
          ) : (
            <Play
              className={cn(
                'size-5 text-white transition-opacity',
                isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
              )}
              fill="white"
            />
          )}
        </div>
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'flex items-center gap-1.5 truncate text-sm font-medium',
            isCurrentTrack ? 'text-red-500' : 'text-foreground',
          )}
        >
          {isCurrentlyPlaying && <Equalizer className="size-3.5 shrink-0" />}
          <span className="truncate">{attributes.name}</span>
        </p>
        <p className="truncate text-xs text-muted-foreground">{attributes.artistName}</p>
      </div>
      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {Math.floor(attributes.durationInMillis / 60000)}:
        {String(Math.floor((attributes.durationInMillis % 60000) / 1000)).padStart(2, '0')}
      </span>
    </motion.div>
  )

  if (albumId) {
    return (
      <Link params={{ album_id: albumId }} to="/albums/$album_id">
        {inner}
      </Link>
    )
  }

  return inner
}

function SectionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-7 w-32" />
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
          <div className="w-36 shrink-0 md:w-44" key={i}>
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="mt-2 flex flex-col gap-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MusicVideoCard({ index, video }: { index: number; video: ChartMusicVideoDatum }) {
  const { attributes } = video
  return (
    <CarouselItem className="basis-56 pl-3 md:basis-72">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 16 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
      >
        <div className="group flex flex-col gap-2">
          <motion.div
            className="relative overflow-hidden rounded-xl shadow-md"
            transition={{ damping: 20, stiffness: 300, type: 'spring' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              alt={attributes.name}
              className="aspect-video w-full object-cover"
              draggable={false}
              src={getArtworkUrl(attributes.artwork.url, 600)}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
              <Play className="size-8 text-white opacity-0 transition-opacity group-hover:opacity-100" fill="white" />
            </div>
          </motion.div>
          <div className="flex flex-col gap-0.5 px-0.5">
            <span className="truncate text-sm font-medium text-foreground">{attributes.name}</span>
            <span className="truncate text-xs text-muted-foreground">{attributes.artistName}</span>
          </div>
        </div>
      </motion.div>
    </CarouselItem>
  )
}

function PlaylistCard({ index, playlist }: { index: number; playlist: ChartPlaylistDatum }) {
  const { attributes } = playlist
  return (
    <CarouselItem className="basis-36 pl-3 md:basis-44">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 16 }}
        transition={{ delay: index * 0.03, duration: 0.3 }}
      >
        <div className="group flex flex-col gap-2">
          <motion.div
            className="relative overflow-hidden rounded-xl shadow-md"
            transition={{ damping: 20, stiffness: 300, type: 'spring' }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <img
              alt={attributes.name}
              className="aspect-square w-full object-cover"
              draggable={false}
              src={getArtworkUrl(attributes.artwork.url, 400)}
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </motion.div>
          <div className="flex flex-col gap-0.5 px-0.5">
            <span className="line-clamp-2 text-sm font-medium text-foreground">{attributes.name}</span>
          </div>
        </div>
      </motion.div>
    </CarouselItem>
  )
}

function AlbumSection({ albums }: { albums: ChartAlbumDatum[] }) {
  if (albums.length === 0) return null

  return (
    <ScrollableRow title="トップアルバム">
      {albums.map((album, index) => (
        <AlbumCard album={album} index={index} key={album.id} />
      ))}
    </ScrollableRow>
  )
}

function MusicVideoSection({ videos }: { videos: ChartMusicVideoDatum[] }) {
  if (videos.length === 0) return null

  return (
    <ScrollableRow title="トップミュージックビデオ">
      {videos.map((video, index) => (
        <MusicVideoCard index={index} key={video.id} video={video} />
      ))}
    </ScrollableRow>
  )
}

function PlaylistSection({ playlists }: { playlists: ChartPlaylistDatum[] }) {
  if (playlists.length === 0) return null

  return (
    <ScrollableRow title="トッププレイリスト">
      {playlists.map((playlist, index) => (
        <PlaylistCard index={index} key={playlist.id} playlist={playlist} />
      ))}
    </ScrollableRow>
  )
}

function TopSongsSection() {
  const { data } = useCharts()

  const songs = data.results.songs?.[0]?.data ?? []
  if (songs.length === 0) return null

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="px-1 text-xl font-bold text-foreground">人気の曲</h2>
      <div className="grid gap-0.5 md:grid-cols-2 xl:grid-cols-4">
        {songs.slice(0, 25).map((song, index) => (
          <SongCard index={index} key={song.id} song={song} />
        ))}
      </div>
    </motion.section>
  )
}

function QuickSearchPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      className="shrink-0 rounded-full bg-muted/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
      onClick={onClick}
      transition={{ damping: 15, stiffness: 400, type: 'spring' }}
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  )
}

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-8 md:gap-10">
      <HeroSkeleton />
      <div className="flex flex-col gap-3">
        <Skeleton className="h-7 w-24" />
        <div className="grid gap-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton
            <Skeleton className="h-16 w-full rounded-xl" key={i} />
          ))}
        </div>
      </div>
      <SectionSkeleton />
    </div>
  )
}

function ChartsContent() {
  const { data } = useCharts()
  const allAlbums = data.results.albums?.[0]?.data ?? []
  const remainingAlbums = allAlbums.slice(3)
  const musicVideos = data.results['music-videos']?.[0]?.data ?? []
  const playlists = data.results.playlists?.[0]?.data ?? []

  return (
    <>
      {/* ヒーローカルーセル */}
      <HeroSection />

      {/* 人気の曲 */}
      <TopSongsSection />

      {/* トップアルバム */}
      <AlbumSection albums={remainingAlbums} />

      {/* トップミュージックビデオ */}
      <MusicVideoSection videos={musicVideos} />

      {/* トッププレイリスト */}
      <PlaylistSection playlists={playlists} />
    </>
  )
}

function Page() {
  useVersionCheck()
  const navigate = useNavigate({ from: '/' })
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (term?: string) => {
    const value = (term ?? searchValue).trim()
    if (value) {
      console.log('[Search] navigate', { term: value })
      navigate({ search: { term: value }, to: '/search' })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSearch()
    }
  }

  const quickSearches = ['YOASOBI', '米津玄師', 'Ado', 'Official髭男dism', 'King Gnu', 'Vaundy']

  return (
    <div className="flex flex-col gap-8 p-4 pb-16 md:gap-10 md:p-6 lg:p-8">
      {/* 検索バー */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 md:hidden"
        initial={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-10 w-full rounded-xl border border-input bg-muted/50 pl-10 pr-4 text-sm text-foreground outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-red-500/40 focus:ring-offset-2 md:max-w-md"
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="アーティスト、アルバム、曲を検索..."
            type="text"
            value={searchValue}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {quickSearches.map((label) => (
            <QuickSearchPill key={label} label={label} onClick={() => handleSearch(label)} />
          ))}
        </div>
      </motion.div>

      <Suspense fallback={<PageSkeleton />}>
        <ChartsContent />
      </Suspense>
    </div>
  )
}
