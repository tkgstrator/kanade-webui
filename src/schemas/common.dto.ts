import { z } from '@hono/zod-openapi'

export const TypeSchema = z.enum([
  'activities',
  'albums',
  'apple-curators',
  'artists',
  'curators',
  'music-videos',
  'playlists',
  'songs',
  'stations',
])

const ArtworkSchema = z.object({
  bgColor: z.string().nonempty().optional(),
  height: z.number().int().positive(),
  textColor1: z.string().nonempty().optional(),
  textColor2: z.string().nonempty().optional(),
  textColor3: z.string().nonempty().optional(),
  textColor4: z.string().nonempty().optional(),
  url: z.string().url(),
  width: z.number().int().positive(),
})

namespace Attribute {
  export const AlbumSchema = z.object({
    artistName: z.string().nonempty(),
    artwork: ArtworkSchema,
    copyright: z.string().nonempty(),
    isCompilation: z.boolean(),
    isComplete: z.boolean(),
    isMasteredForItunes: z.boolean(),
    isSingle: z.boolean(),
    name: z.string().nonempty(),
    playParams: z.record(z.string(), z.unknown()),
    recordLabel: z.string().nonempty(),
    releaseDate: z.string().nonempty(),
    trackCount: z.number().int().positive(),
    upc: z.string().nonempty(),
    url: z.string().nonempty(),
  })

  export const ArtistSchema = z.object({
    artwork: ArtworkSchema.optional(),
    genreNames: z.array(z.string().nonempty()),
    name: z.string().nonempty(),
    url: z.string().url(),
  })

  export const MusicVideoSchema = z.object({
    artistName: z.string().nonempty(),
    artwork: ArtworkSchema,
    has4K: z.boolean(),
    hasHDR: z.boolean(),
    name: z.string().nonempty(),
    releaseDate: z.string().nonempty(),
  })

  export const PlaylistSchema = z.object({
    artwork: ArtworkSchema.partial({
      bgColor: true,
      textColor1: true,
      textColor2: true,
      textColor3: true,
      textColor4: true,
    }),
    isChart: z.boolean(),
    name: z.string().nonempty(),
    url: z.string().url(),
  })

  export const SongSchema = z.object({
    albumName: z.string().nonempty(),
    artistName: z.string().nonempty(),
    artwork: ArtworkSchema,
    composerName: z.string().nonempty().optional(),
    discNumber: z.number().int().positive(),
    durationInMillis: z.number().int().positive(),
    hasLyrics: z.boolean(),
    isAppleDigitalMaster: z.boolean(),
    name: z.string().nonempty(),
    previews: z.array(z.object({ url: z.string().url() })).optional(),
    releaseDate: z.string().nonempty().optional(),
    trackNumber: z.number().int().positive(),
    url: z.string().url(),
  })

  export const StationSchema = z.object({
    artwork: ArtworkSchema,
    isLive: z.boolean(),
    url: z.string().url(),
  })
}

const DatumSchema = z.object({
  href: z.string().nonempty(),
  id: z.string().nonempty(),
})

const RelationshipSchema = z.record(
  z.enum(['artists', 'tracks', 'music-videos', 'albums', 'station']),
  z
    .object({
      data: z
        .discriminatedUnion('type', [
          DatumSchema.extend({
            id: z.coerce.number().int().positive(),
            type: z.literal('artists'),
          }),
          DatumSchema.extend({
            attributes: Attribute.SongSchema.extend({
              durationInMillis: z.number().int().positive().optional(),
              releaseDate: z.string().nonempty().optional(),
            }),
            id: z.coerce.number().int().positive(),
            type: z.literal('songs'),
          }),
          DatumSchema.extend({
            attributes: Attribute.AlbumSchema,
            id: z.coerce.number().int().positive(),
            type: z.literal('albums'),
          }),
          DatumSchema.extend({ type: z.literal('stations') }),
          DatumSchema.extend({ id: z.coerce.number().int().positive(), type: z.literal('music-videos') }),
        ])
        .array(),
      href: z.string().nonempty(),
    })
    .optional(),
)

export const MetaSchema = z.object({})

const ViewSchema = z.object({
  data: z
    .discriminatedUnion('type', [
      DatumSchema.extend({
        attributes: Attribute.AlbumSchema,
        type: z.literal('albums'),
      }),
      DatumSchema.extend({
        attributes: Attribute.ArtistSchema,
        type: z.literal('artists'),
      }),
      DatumSchema.extend({
        attributes: Attribute.MusicVideoSchema,
        type: z.literal('music-videos'),
      }),
      DatumSchema.extend({
        attributes: Attribute.PlaylistSchema,
        type: z.literal('playlists'),
      }),
      DatumSchema.extend({
        attributes: Attribute.SongSchema,
        type: z.literal('songs'),
      }),
      DatumSchema.extend({
        attributes: Attribute.StationSchema,
        type: z.literal('stations'),
      }),
      DatumSchema.extend({
        type: z.literal('apple-curators'),
      }),
    ])
    .array(),
  href: z.string().nonempty(),
  meta: MetaSchema.optional(),
  next: z.string().nonempty().optional(),
})

export namespace SearchCatalogResources {
  export const ParamSchema = z.object({
    storefront: z.enum(['jp']),
  })

  export const QuerySchema = z.object({
    l: z.enum(['ja']).optional(),
    limit: z.coerce.number().int().positive().max(25).optional().default(5),
    offset: z.coerce.number().int().min(0).optional().default(0),
    term: z.string().nonempty(),
    types: z.array(TypeSchema).nonempty().optional(),
    with: z.array(z.enum(['topResults'])).optional(),
  })

  export const ResponseSchema = z.object({
    results: z.record(TypeSchema, ViewSchema.optional()),
  })
}

export namespace SearchHints {
  export const QuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(10).optional().default(10),
    term: z.string().nonempty(),
  })

  export const ResponseSchema = z.object({
    results: z.object({
      terms: z.array(z.string()),
    }),
  })
}

export namespace GetCatalogAlbum {
  export const ViewType = z.enum(['appears-on', 'other-versions', 'related-albums', 'related-videos'])

  export const ParamSchema = z.object({
    id: z.coerce.number().int().positive(),
    storefront: z.enum(['jp']).optional().default('jp'),
  })

  export const QuerySchema = z.object({
    extend: z.array(z.string()).optional(),
    include: z.array(z.string()).nonempty().optional(),
    l: z.enum(['ja']).optional(),
    views: z.array(ViewType).nonempty().optional(),
  })

  export const ResponseSchema = z.object({
    data: DatumSchema.extend({
      attributes: Attribute.AlbumSchema,
      id: z.coerce.number().int().positive(),
      relationships: RelationshipSchema,
    })
      .array()
      .nonempty(),
  })
}

export namespace GetCatalogArtist {
  const ViewType = z.enum([
    'appears-on-albums',
    'compilation-albums',
    'featured-albums',
    'featured-music-videos',
    'featured-playlists',
    'latest-release',
    'live-album',
    'similar-artists',
    'singles',
    'top-music-videos',
    'top-songs',
  ])

  export const ParamSchema = z.object({
    id: z.coerce.number().int().positive(),
    storefront: z.enum(['jp']).optional().default('jp'),
  })

  export const QuerySchema = z.object({
    extend: z.array(z.string()).optional(),
    include: z.array(z.string()).nonempty().optional(),
    l: z.enum(['ja']).optional().default('ja'),
    views: z.array(ViewType).nonempty().optional(),
  })
}

export const CatalogSchema = z.object({
  data: z
    .discriminatedUnion('type', [
      DatumSchema.extend({
        attributes: Attribute.AlbumSchema,
        id: z.coerce.number().int().positive(),
        relationships: RelationshipSchema,
        type: z.literal('albums'),
      }),
      DatumSchema.extend({
        attributes: Attribute.ArtistSchema,
        id: z.coerce.number().int().positive(),
        relationships: RelationshipSchema,
        type: z.literal('artists'),
      }),
    ])
    .array()
    .nonempty(),
})

export type Catalog = z.infer<typeof CatalogSchema>
export type CatalogAlbumDatum = Extract<Catalog['data'][number], { type: 'albums' }>
export type CatalogArtistDatum = Extract<Catalog['data'][number], { type: 'artists' }>

type SearchResults = z.infer<typeof SearchCatalogResources.ResponseSchema>['results']
type ViewData = NonNullable<SearchResults[keyof SearchResults]>['data']
export type AlbumDatum = Extract<ViewData[number], { type: 'albums' }>
export type SongDatum = Extract<ViewData[number], { type: 'songs' }>

export const VersionResponseSchema = z.object({
  buildAt: z.string(),
  hash: z.string(),
  version: z.string(),
})

export const ChartTypeSchema = z.enum(['albums', 'music-videos', 'playlists', 'songs'])
type ChartResults = z.infer<typeof GetCatalogCharts.ResponseSchema>['results']
export type ChartAlbumDatum = NonNullable<ChartResults['albums']>[number]['data'][number]
export type ChartMusicVideoDatum = NonNullable<ChartResults['music-videos']>[number]['data'][number]
export type ChartPlaylistDatum = NonNullable<ChartResults['playlists']>[number]['data'][number]
export type ChartSongDatum = NonNullable<ChartResults['songs']>[number]['data'][number]

export namespace GetCatalogCharts {
  export const QuerySchema = z
    .object({
      chart: z.string().nonempty().optional(),
      l: z.enum(['ja']).optional(),
      limit: z.coerce.number().int().positive().max(200).optional().default(25),
      types: z
        .preprocess((v) => (typeof v === 'string' ? v.split(',') : v), z.array(ChartTypeSchema).nonempty())
        .optional(),
      'types[]': z.array(ChartTypeSchema).nonempty().optional(),
    })
    .transform((v) => ({
      chart: v.chart,
      l: v.l,
      limit: v.limit,
      types: v.types ?? v['types[]'] ?? [],
    }))

  const ChartEntrySchema = z.object({
    chart: z.string().nonempty(),
    href: z.string().nonempty(),
    name: z.string().nonempty(),
    next: z.string().nonempty().optional(),
  })

  export const ResponseSchema = z.object({
    results: z.object({
      albums: z
        .array(
          ChartEntrySchema.extend({
            data: DatumSchema.extend({
              attributes: Attribute.AlbumSchema.partial({
                copyright: true,
                isCompilation: true,
                isComplete: true,
                isMasteredForItunes: true,
                isSingle: true,
                playParams: true,
                recordLabel: true,
                upc: true,
              }),
              type: z.literal('albums'),
            }).array(),
          }),
        )
        .optional(),
      'music-videos': z
        .array(
          ChartEntrySchema.extend({
            data: DatumSchema.extend({
              attributes: Attribute.MusicVideoSchema.partial({
                has4K: true,
                hasHDR: true,
                releaseDate: true,
              }),
              type: z.literal('music-videos'),
            }).array(),
          }),
        )
        .optional(),
      playlists: z
        .array(
          ChartEntrySchema.extend({
            data: DatumSchema.extend({
              attributes: Attribute.PlaylistSchema.partial({
                isChart: true,
              }),
              type: z.literal('playlists'),
            }).array(),
          }),
        )
        .optional(),
      songs: z
        .array(
          ChartEntrySchema.extend({
            data: DatumSchema.extend({
              attributes: Attribute.SongSchema,
              type: z.literal('songs'),
            }).array(),
          }),
        )
        .optional(),
    }),
  })
}
