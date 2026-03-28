import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { type JSX, Suspense } from 'react'
import { z } from 'zod'
import { AlbumSection, ArtistHeader, ArtistSkeleton } from '@/components/artist'
import { client } from '@/lib/client'
import type { CatalogArtistDatum } from '@/schemas/common.dto'

export const Route = createFileRoute('/artists/$artist_id')({
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
      return await client.get('/api/artists/:id', {
        params: { id: artist_id },
        queries: { include: ['albums', 'music-videos'] },
      })
    },
    queryKey: ['artist', artist_id],
  })

  const artist = data.data[0] as CatalogArtistDatum
  const albumsData = (artist.relationships?.albums?.data ?? []).filter(
    (a): a is Extract<typeof a, { type: 'albums' }> => a.type === 'albums',
  )

  const fullAlbums = albumsData.filter((album) => album.attributes?.isSingle === false)
  const singles = albumsData.filter((album) => album.attributes?.isSingle === true)

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
