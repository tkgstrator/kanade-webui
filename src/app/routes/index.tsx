'use client'

import { createFileRoute, Link } from '@tanstack/react-router'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { client } from '@/lib/client'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: Page,
  // loader: async () => {
  //   return await client.get("/api/charts", {
  //     queries: {
  //       genre: 29,
  //       limit: 100,
  //       types: "albums",
  //     },
  //   })
  // },
})

function getArtworkUrl(url: string, size: number): string {
  return url.replace('{w}', size.toString()).replace('{h}', size.toString())
}

type ChartAlbum = {
  attributes: {
    artistName: string
    artwork: {
      url: string
    }
    name: string
    editorialNotes?: {
      short: string
    }
  }
  id: string
}

function AlbumCard({ album, rank }: { album: ChartAlbum; rank: number }) {
  const { attributes } = album

  return (
    <Link className="group flex flex-col gap-2" params={{ album_id: Number(album.id) }} to="/albums/$album_id">
      <div className="relative overflow-hidden rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.02]">
        <img
          alt={attributes.name}
          className="aspect-square w-full object-cover"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 400)}
        />
        <div className="absolute bottom-2 left-2 flex size-8 items-center justify-center rounded-full bg-black/60 text-sm font-bold text-white">
          {rank}
        </div>
      </div>
      <div className="flex flex-col px-1">
        <Link to="/">
          <span className="truncate text-sm font-medium text-foreground group-hover:underline">{attributes.name}</span>
        </Link>
        <Link to="/">
          <span className="truncate text-xs text-muted-foreground">{attributes.artistName}</span>
        </Link>
      </div>
    </Link>
  )
}

function ChartSection({ title, albums }: { title: string; albums: ChartAlbum[] }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
      </div>
      <Carousel
        className="w-full"
        opts={{
          align: 'start',
          dragFree: true,
          loop: true,
        }}
      >
        <CarouselContent className="-ml-3">
          {albums.map((album, index) => (
            <CarouselItem
              className={cn('basis-1/2 pl-3 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6', 'max-w-[220px]')}
              key={album.id}
            >
              <AlbumCard album={album} rank={index + 1} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 backdrop-blur-sm border-none shadow-md hover:bg-background" />
        <CarouselNext className="hidden md:flex -right-4 bg-background/80 backdrop-blur-sm border-none shadow-md hover:bg-background" />
      </Carousel>
    </section>
  )
}

function HeroSection({ album }: { album: ChartAlbum }) {
  const { attributes } = album

  return (
    <Link
      className="w-full h-64 overflow-hidden"
      // className={cn(
      //   "relative flex h-64 w-full overflow-hidden rounded-xl md:h-80",
      //   "bg-linear-to-r from-pink-500/20 to-purple-500/20 dark:from-pink-900/30 dark:to-purple-900/30",
      // )}
      params={{ album_id: Number(album.id) }}
      to="/albums/$album_id"
    >
      <div className="absolute inset-0 z-0">
        <img
          alt={attributes.name}
          className="h-full w-full object-cover opacity-30 blur-2xl"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 600)}
        />
      </div>
      <div className="relative z-10 flex w-full items-center gap-6 p-6 md:p-8">
        <img
          alt={attributes.name}
          className="aspect-square w-32 rounded-lg object-cover shadow-xl md:w-48"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 400)}
        />
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">トップアルバム</span>
          <h1 className="text-2xl font-bold text-foreground md:text-4xl">{attributes.name}</h1>
          <span className="text-lg text-muted-foreground md:text-xl">{attributes.artistName}</span>
          {attributes.editorialNotes?.short && (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground md:line-clamp-3">
              {attributes.editorialNotes.short}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

function Page() {
  // const data = Route.useLoaderData()
  // const albums = data.results.albums[0]?.data ?? []

  // if (albums.length === 0) {
  //   return (
  //     <div className="flex h-[50vh] items-center justify-center">
  //       <p className="text-muted-foreground">アルバムが見つかりませんでした</p>
  //     </div>
  //   )
  // }

  // const topAlbum = albums[0]
  // const topChartAlbums = albums.slice(0, 10)
  // const newReleases = albums.slice(10, 20)

  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8">
      {/* <HeroSection album={topAlbum} /> */}
      {/* <ChartSection albums={topChartAlbums} title="トップチャート" /> */}
      {/* {newReleases.length > 0 && <ChartSection albums={newReleases} title="注目のアルバム" />} */}
    </div>
  )
}
