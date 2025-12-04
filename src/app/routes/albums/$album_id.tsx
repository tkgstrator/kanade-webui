"use client"

import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { Download, Shuffle } from "lucide-react"
import { type JSX, Suspense, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { type AlbumsDatum, client, type SongsDatum } from "@/lib/client"
import { cn } from "@/lib/utils"

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
  console.log(album)

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
    <div className="flex flex-col items-center gap-6 md:flex-row md:items-start w-full">
      <img
        alt={attributes.name}
        className="aspect-square w-full max-w-[270px] rounded-lg object-cover shadow-lg"
        draggable={false}
        src={getArtworkUrl(attributes.artwork.url, 600)}
      />
      <div className="flex flex-1 flex-col items-center justify-end md:gap-2 md:items-start">
        <p className="hidden md:block text-sm font-medium text-muted-foreground uppercase">
          {attributes.isSingle ? "シングル" : "アルバム"}
        </p>
        <h1 className="text-3xl font-bold text-foreground text-center md:text-left md:text-4xl">{attributes.name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            className="font-medium text-foreground hover:underline"
            params={{ artist_id: album.id }}
            to="/artists/$artist_id"
          >
            {attributes.artistName}
          </Link>
          <span>•</span>
          <span>{attributes.releaseDate.split("-")[0]}</span>
          {attributes.trackCount && (
            <>
              <span>•</span>
              <span>{attributes.trackCount}曲</span>
            </>
          )}
        </div>
        {attributes.editorialNotes?.standard && (
          <p className="hidden md:block mt-2 text-sm text-muted-foreground text-center md:text-left line-clamp-3">
            {attributes.editorialNotes.standard}
          </p>
        )}
        {attributes.copyright && (
          <p className="hidden md:block mt-4 text-xs text-muted-foreground">{attributes.copyright}</p>
        )}
        <div className="mt-4 flex gap-3">
          <Button
            className="bg-red-600 hover:bg-red-700 text-white px-4 h-7 text-sm rounded-sm"
            onClick={() => mutate()}
          >
            <Download className="size-4" />
            ダウンロード
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white px-4 h-7 text-sm rounded-sm">
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
    <div
      className={cn(
        "group flex items-center gap-4 rounded-md px-4 py-2 transition-colors cursor-pointer",
        isSelected
          ? "bg-blue-500 dark:bg-blue-600 text-white"
          : cn(index % 2 === 0 ? "bg-transparent" : "bg-muted/40", "hover:bg-muted"),
      )}
      onClick={onSelect}
    >
      <span className={cn("w-6 text-center text-sm tabular-nums", isSelected ? "text-white" : "text-muted-foreground")}>
        {attributes.trackNumber ?? index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn("truncate font-medium", isSelected ? "text-white" : "text-foreground")}>{attributes.name}</p>
        {attributes.artistName && (
          <p className={cn("truncate text-sm", isSelected ? "text-white/80" : "text-muted-foreground")}>
            {attributes.artistName}
          </p>
        )}
      </div>
      {attributes.durationInMillis && (
        <span className={cn("text-sm tabular-nums", isSelected ? "text-white/80" : "text-muted-foreground")}>
          {formatDuration(attributes.durationInMillis)}
        </span>
      )}
    </div>
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
      <div className="flex flex-col gap-6 md:flex-row">
        <Skeleton className="aspect-square w-full max-w-[270px] rounded-lg" />
        <div className="flex flex-col justify-end gap-2">
          <Skeleton className="h-4 w-16" />
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
