"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { type JSX, Suspense } from "react"
import { z } from "zod"
import { AlbumSection, ArtistHeader, ArtistSkeleton } from "@/components/artist"
import { client } from "@/lib/client"

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

  const artist = data.data[0]
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
