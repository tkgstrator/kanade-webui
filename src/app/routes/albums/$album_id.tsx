'use client'

import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type JSX, Suspense } from 'react'
import { z } from 'zod'
import { AlbumHeader, AlbumSkeleton, TrackList } from '@/components/album'
import { type CatalogAlbumDatum, client } from '@/lib/client'

export const Route = createFileRoute('/albums/$album_id')({
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

const Content = (): JSX.Element => {
  const { album_id } = Route.useParams()
  const { data } = useSuspenseQuery({
    queryFn: async () =>
      client.get('/api/albums/:id', {
        params: {
          id: album_id,
        },
      }),
    queryKey: ['album', album_id],
  })

  // console.log(albums)

  // const album = albums[0] as CatalogAlbumDatum
  // const tracks = album.relationships?.tracks?.data?.filter((t) => t.type === 'songs') ?? []

  return (
    <div className="flex flex-col gap-8 pb-8 select-none">
      {/* <AlbumHeader album={album} />
      <section className="w-full px-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">収録曲</h2>
        <TrackList tracks={tracks} />
      </section> */}
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
