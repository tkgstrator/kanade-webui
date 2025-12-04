"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import "dayjs/locale/ja"
import { Shuffle } from "lucide-react"
import { type JSX, Suspense } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { client } from "@/lib/client"

dayjs.extend(localizedFormat)
dayjs.locale("ja")

export const Route = createFileRoute("/artists/$artist_id")({
  component: Page,
  params: {
    parse: (params) =>
      z
        .object({
          artist_id: z.coerce.number().int().positive(),
        })
        .parse(params),
    stringify: (params) => ({ artist_id: String(params.artist_id) }),
  },
})

function getArtworkUrl(url: string, size: number): string {
  return url.replace("{w}", size.toString()).replace("{h}", size.toString())
}

type ArtistData = {
  attributes: {
    artwork: {
      url: string
      bgColor: string
    }
    genreNames: string[]
    name: string
    url: string
  }
  id: string
  relationships: {
    albums: {
      data: AlbumData[]
    }
  }
}

type AlbumData = {
  attributes: {
    artistName: string
    artwork: {
      url: string
    }
    name: string
    releaseDate: string
    isSingle: boolean
    trackCount: number
  }
  id: string
}

function ArtistHeader({ artist }: { artist: ArtistData }) {
  const { attributes } = artist

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          alt={attributes.name}
          className="h-full w-full object-cover opacity-40 blur-2xl scale-110"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 800)}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 pt-8 pb-6 md:flex-row md:items-end md:gap-8 md:px-8 md:pt-12">
        <img
          alt={attributes.name}
          className="size-40 rounded-full object-cover shadow-2xl ring-4 ring-background/50 md:size-52"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 400)}
        />
        <div className="flex flex-col items-center gap-3 md:items-start md:pb-2">
          <h1 className="text-3xl font-bold text-foreground md:text-5xl">{attributes.name}</h1>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {attributes.genreNames.slice(0, 3).map((genre) => (
              <span
                className="rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                key={genre}
              >
                {genre}
              </span>
            ))}
          </div>
          <div className="h-9" />
          {/* <Button className="mt-2 bg-red-600 hover:bg-red-700 text-white px-6 h-9 text-sm rounded-full gap-2">
            <Shuffle className="size-4" />
            シャッフル再生
          </Button> */}
        </div>
      </div>
    </div>
  )
}

function AlbumCard({ album }: { album: AlbumData }) {
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
      </div>
      <div className="flex flex-col px-1">
        <span className="truncate text-sm font-medium text-foreground group-hover:underline">{attributes.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {dayjs(attributes.releaseDate).format("YYYY")} · {attributes.isSingle ? "シングル" : "アルバム"}
        </span>
      </div>
    </Link>
  )
}

function AlbumSection({ title, albums }: { title: string; albums: AlbumData[] }) {
  if (albums.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground px-6 md:px-8">{title}</h2>
      <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 md:grid-cols-4 md:px-8 lg:grid-cols-5 xl:grid-cols-6">
        {albums.map((album) => (
          <div className="max-w-[220px]" key={album.id}>
            <AlbumCard album={album} />
          </div>
        ))}
      </div>
    </section>
  )
}

function ArtistSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-6 px-6 pt-8 pb-6 md:flex-row md:items-end md:gap-8 md:px-8 md:pt-12">
        <Skeleton className="size-40 rounded-full md:size-52" />
        <div className="flex flex-col items-center gap-3 md:items-start">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-9 w-32 rounded-full" />
        </div>
      </div>
      <div className="px-6 md:px-8">
        <Skeleton className="h-7 w-32 mb-4" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div className="flex flex-col gap-2" key={i}>
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const Content = (): JSX.Element => {
  const { artist_id } = Route.useParams()
  const { data } = useSuspenseQuery({
    queryFn: async () => {
      return await client.get("/api/artists/:artist_id", {
        params: { artist_id: artist_id },
      })
    },
    queryKey: ["artist", artist_id],
  })

  const artist = data.data[0] as unknown as ArtistData
  const albums = artist.relationships.albums.data

  const fullAlbums = albums.filter((album) => !album.attributes.isSingle)
  const singles = albums.filter((album) => album.attributes.isSingle)

  return (
    <div className="flex flex-col gap-8 pb-8 select-none">
      <ArtistHeader artist={artist} />
      <AlbumSection albums={fullAlbums} title="アルバム" />
      <AlbumSection albums={singles} title="シングル・EP" />
    </div>
  )
}

function Page() {
  return (
    <Suspense fallback={<ArtistSkeleton />}>
      <Content />
    </Suspense>
  )
}
