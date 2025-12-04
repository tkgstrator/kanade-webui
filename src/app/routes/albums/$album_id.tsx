"use client"

import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import dayjs from "dayjs"
import localizedFormat from "dayjs/plugin/localizedFormat"
import "dayjs/locale/ja"
import { Download, Shuffle } from "lucide-react"
import { type JSX, Suspense, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type AlbumsDatum, client, type SongsDatum } from "@/lib/client"
import { cn } from "@/lib/utils"

dayjs.extend(localizedFormat)
dayjs.locale("ja")

export const Route = createFileRoute("/albums/$album_id")({
  component: Page,
  params: {
    parse: (params) =>
      z
        .object({
          album_id: z.coerce.number().int().positive(),
        })
        .parse(params),
    stringify: (params) => ({ album_id: String(params.album_id) }),
  },
})

function getArtworkUrl(url: string, size: number): string {
  return url.replace("{w}", size.toString()).replace("{h}", size.toString())
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function AlbumHeader({ album }: { album: AlbumsDatum }) {
  const { attributes } = album

  const { mutate } = useMutation({
    mutationFn: async () =>
      client.get("/api/queues/:album_id", {
        params: { album_id: album.id },
      }),
    mutationKey: ["queues", album.id],
    onError: (error) => {
      console.error(error)
      toast.error("キューへの追加に失敗しました")
    },
    onSuccess: () => {
      toast.success("キューに追加されました")
    },
  })

  return (
    <div className="flex flex-col items-center gap-6 lg:grid lg:grid-cols-[auto_1fr] w-full">
      <img
        alt={attributes.name}
        className="aspect-square w-full max-w-[270px] rounded-lg object-cover shadow-lg"
        draggable={false}
        src={getArtworkUrl(attributes.artwork.url, 600)}
      />
      <div className="flex flex-col items-center lg:items-start lg:justify-between lg:h-full gap-4">
        <div />
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="text-3xl text-foreground text-center lg:text-left font-semibold">{attributes.name}</h1>
          <Link
            className="font-medium text-foreground hover:underline text-2xl"
            params={{ artist_id: album.id }}
            to="/artists/$artist_id"
          >
            {attributes.artistName}
          </Link>
          <span className="text-sm text-muted-foreground">{dayjs(attributes.releaseDate).format("LL")}</span>
        </div>
        <div className="flex gap-4">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-4 h-7 w-[127px] text-sm rounded-sm gap-2"
            onClick={() => mutate()}
          >
            <Download className="size-4" />
            ダウンロード
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white px-4 h-7 w-[127px] text-sm rounded-sm gap-2">
            <Shuffle className="size-4" />
            シャッフル
          </Button>
        </div>
      </div>
    </div>
  )
}

function TrackListItem({
  track,
  index,
  isSelected,
  onSelect,
}: {
  track: SongsDatum
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
        "group flex items-center gap-4 rounded-md px-4 py-2 h-12 transition-colors w-full text-left",
        isSelected
          ? "bg-blue-500 dark:bg-blue-600 text-white"
          : cn(index % 2 === 0 ? "bg-transparent" : "bg-muted/40", "hover:bg-muted"),
      )}
      onClick={onSelect}
      type="button"
    >
      <span
        className={cn(
          "w-6 text-center text-sm tabular-nums self-start mt-1",
          isSelected ? "text-white" : "text-muted-foreground",
        )}
      >
        {attributes.trackNumber ?? index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-md", isSelected ? "text-white" : "text-foreground")}>{attributes.name}</p>
      </div>
      {attributes.durationInMillis && (
        <span className={cn("text-sm tabular-nums", isSelected ? "text-white/80" : "text-muted-foreground")}>
          {formatDuration(attributes.durationInMillis)}
        </span>
      )}
    </button>
  )
}

function TrackList({ tracks }: { tracks: SongsDatum[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  return (
    <div className="flex flex-col w-full">
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

function AlbumSkeleton() {
  return (
    <div className="flex flex-col gap-8 p-6">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <Skeleton className="aspect-square w-full max-w-[270px] rounded-lg" />
        <div className="flex flex-col items-center justify-end gap-2 md:items-start">
          <Skeleton className="hidden md:block h-4 w-16" />
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {[...Array(8)].map((_, i) => (
          <Skeleton className="h-14 w-full rounded-md" key={i} />
        ))}
      </div>
    </div>
  )
}

const Content = (): JSX.Element => {
  const { album_id } = Route.useParams()
  const {
    data: { data: albums },
  } = useSuspenseQuery({
    queryFn: async () =>
      client.get("/api/albums/:album_id", {
        params: {
          album_id,
        },
      }),
    queryKey: ["album", album_id],
  })

  return (
    <div className="flex flex-col gap-8 p-6 select-none w-full">
      <AlbumHeader album={albums[0]} />
      <section className="w-full">
        <h2 className="mb-4 text-lg font-semibold text-foreground">収録曲</h2>
        <TrackList tracks={albums[0].relationships.tracks.data} />
      </section>
    </div>
  )
}

function Page() {
  return (
    <Suspense fallback={<AlbumSkeleton />}>
      <Content />
    </Suspense>
  )
}
