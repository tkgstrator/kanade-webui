import { z } from '@hono/zod-openapi'

export const TypeSchema = z
  .enum([
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
  .openapi('Type')

const ArtworkSchema = z
  .object({
    bgColor: z.string().nonempty(),
    height: z.number().int().positive(),
    textColor1: z.string().nonempty(),
    textColor2: z.string().nonempty(),
    textColor3: z.string().nonempty(),
    textColor4: z.string().nonempty(),
    url: z.url(),
    width: z.number().int().positive(),
  })
  .openapi('Artwork')

namespace Attribute {
  export const AlbumSchema = z
    .object({
      artistName: z.string().nonempty(),
      artwork: ArtworkSchema,
      copyright: z.string().nonempty(),
      isCompilation: z.boolean(),
      isComplete: z.boolean(),
      isMasteredForItunes: z.boolean(),
      isSingle: z.boolean(),
      name: z.string().nonempty(),
      playParams: z.object({}),
      recordLabel: z.string().nonempty(),
      releaseDate: z.coerce.date(),
      trackCount: z.number().int().positive(),
      upc: z.string().nonempty(),
      url: z.string().nonempty(),
    })
    .openapi('AlbumAttributes')

  export const ArtistSchema = z
    .object({
      artwork: ArtworkSchema.optional(),
      genreNames: z.array(z.string().nonempty()),
      name: z.string().nonempty(),
      url: z.url(),
    })
    .openapi('ArtistAttributes')

  export const MusicVideoSchema = z
    .object({
      artistName: z.string().nonempty(),
      artwork: ArtworkSchema,
      has4K: z.boolean(),
      hasHDR: z.boolean(),
      name: z.string().nonempty(),
      releaseDate: z.coerce.date(),
    })
    .openapi('MusicVideoAttributes')

  export const PlaylistSchema = z
    .object({
      artwork: ArtworkSchema.partial({
        bgColor: true,
        textColor1: true,
        textColor2: true,
        textColor3: true,
        textColor4: true,
      }),
      isChart: z.boolean(),
      name: z.string().nonempty(),
      url: z.url(),
    })
    .openapi('PlaylistAttributes')

  export const SongSchema = z
    .object({
      albumName: z.string().nonempty(),
      artistName: z.string().nonempty(),
      artwork: ArtworkSchema,
      composerName: z.string().nonempty().optional(),
      discNumber: z.number().int().positive(),
      durationInMillis: z.number().int().positive(),
      hasLyrics: z.boolean(),
      isAppleDigitalMaster: z.boolean(),
      name: z.string().nonempty(),
      releaseDate: z.coerce.date().optional(),
      trackNumber: z.number().int().positive(),
      url: z.url(),
    })
    .openapi('SongAttributes')

  export const StationSchema = z
    .object({
      artwork: ArtworkSchema,
      isLive: z.boolean(),
      url: z.url(),
    })
    .openapi('StationAttributes')
}

const DatumSchema = z
  .object({
    href: z.string().nonempty(),
    id: z.string().nonempty(),
  })
  .openapi('Datum')

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
              releaseDate: z.coerce.date().optional(),
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

export const MetaSchema = z.object({}).openapi('Meta')

const ViewSchema = z.object({
  data: z
    .discriminatedUnion('type', [
      DatumSchema.extend({
        attributes: Attribute.AlbumSchema,
        type: z.literal('albums'),
      }).openapi('AlbumDatum'),
      DatumSchema.extend({
        attributes: Attribute.ArtistSchema,
        type: z.literal('artists'),
      }).openapi('ArtistDatum'),
      DatumSchema.extend({
        attributes: Attribute.MusicVideoSchema,
        type: z.literal('music-videos'),
      }).openapi('MusicVideoDatum'),
      DatumSchema.extend({
        attributes: Attribute.PlaylistSchema,
        type: z.literal('playlists'),
      }).openapi('PlaylistDatum'),
      DatumSchema.extend({
        attributes: Attribute.SongSchema,
        type: z.literal('songs'),
      }).openapi('SongDatum'),
      DatumSchema.extend({
        attributes: Attribute.StationSchema,
        type: z.literal('stations'),
      }).openapi('StationDatum'),
    ])
    .array(),
  href: z.string().nonempty(),
  meta: MetaSchema.optional(),
  next: z.string().nonempty().optional(),
})

export namespace SearchCatalogResources {
  export const ParamSchema = z
    .object({
      storefront: z.enum(['jp']),
    })
    .openapi('SearchCatalogResourcesParam')

  export const QuerySchema = z
    .object({
      l: z.enum(['ja']).optional(),
      limit: z.number().int().positive().max(25).optional().default(5),
      offset: z.number().int().min(0).optional().default(0),
      term: z.string().nonempty(),
      types: z.array(TypeSchema).nonempty().optional(),
      with: z.array(z.enum(['topResults'])).optional(),
    })
    .openapi('SearchCatalogResourcesQuery')

  export const ResponseSchema = z
    .object({
      results: z.record(TypeSchema, ViewSchema.optional()),
    })
    .openapi('SearchCatalogResourcesResponse')
}

export namespace GetCatalogAlbum {
  export const ViewType = z
    .enum(['appears-on', 'other-versions', 'related-albums', 'related-videos'])
    .openapi('AlbumViewType')

  export const ParamSchema = z
    .object({
      id: z.coerce.number().int().positive(),
      storefront: z.enum(['jp']).optional().default('jp'),
    })
    .openapi('GetCatalogAlbumParam')

  export const QuerySchema = z
    .object({
      extend: z.array(z.string()).optional(),
      include: z.array(z.string()).nonempty().optional(),
      l: z.enum(['ja']).optional(),
      views: z.array(ViewType).nonempty().optional(),
    })
    .openapi('GetCatalogAlbumQuery')

  export const ResponseSchema = z
    .object({
      data: DatumSchema.extend({
        attributes: Attribute.AlbumSchema,
        id: z.coerce.number().int().positive(),
        relationships: RelationshipSchema,
      })
        .array()
        .nonempty(),
    })
    .openapi('GetCatalogAlbumResponse')
}

export namespace GetCatalogArtist {
  const ViewType = z
    .enum([
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
    .openapi('ArtistViewType')

  export const ParamSchema = z
    .object({
      id: z.coerce.number().int().positive(),
      storefront: z.enum(['jp']).optional().default('jp'),
    })
    .openapi('GetCatalogArtistParam')

  export const QuerySchema = z
    .object({
      extend: z.array(z.string()).optional(),
      include: z.array(z.string()).nonempty().optional(),
      l: z.enum(['ja']).optional().default('ja'),
      views: z.array(ViewType).nonempty().optional(),
    })
    .openapi('GetCatalogArtistQuery')
}

//   export const ResponseSchema = z.object({
//     data: z
//       .discriminatedUnion('type', [
//         DatumSchema.extend({
//           attributes: Attribute.AlbumSchema,
//           type: z.literal('albums'),
//         }),
//         DatumSchema.extend({
//           attributes: Attribute.ArtistSchema,
//           type: z.literal('artists'),
//         }),
//         DatumSchema.extend({
//           attributes: Attribute.MusicVideoSchema,
//           type: z.literal('music-videos'),
//         }),
//       ])
//       .array()
//       .nonempty(),
//   })
// }

export const CatalogSchema = z
  .object({
    data: z
      .discriminatedUnion('type', [
        DatumSchema.extend({
          attributes: Attribute.AlbumSchema,
          id: z.coerce.number().int().positive(),
          relationships: RelationshipSchema,
          type: z.literal('albums'),
        }).openapi('CatalogAlbumDatum'),
        DatumSchema.extend({
          attributes: Attribute.ArtistSchema,
          id: z.coerce.number().int().positive(),
          relationships: RelationshipSchema,
          type: z.literal('artists'),
        }).openapi('CatalogArtistDatum'),
      ])
      .array()
      .nonempty(),
  })
  .openapi('Catalog')
