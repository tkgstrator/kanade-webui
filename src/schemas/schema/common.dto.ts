import { z } from '@hono/zod-openapi'
import { ArtistAttributes } from '@/lib/client'

export const MetaSchema = z.object({})

export const RelationshipSchema = z.object({
  data: z.array(z.any()),
  href: z.string().nonempty(),
  meta: MetaSchema.optional(),
  next: z.string().nonempty().optional(),
})

type View = {
  // biome-ignore lint/suspicious/noExplicitAny: reason
  // attributes: any[]
  data: Resource[]
  href: string
  meta?: z.infer<typeof MetaSchema>
  next?: string
}

type Resource = {
  // biome-ignore lint/suspicious/noExplicitAny: reason
  // attributes: any[]
  href: string
  id: number
  meta: z.infer<typeof MetaSchema>
  relationships: z.infer<typeof RelationshipSchema>[]
  type: string
  views: View[]
}

export const ViewSchema: z.ZodType<View> = z.object({
  // biome-ignore lint/suspicious/noExplicitAny: reason
  // attributes: z.array(z.any()),
  data: z.lazy(() => z.array(ResourceSchema)),
  href: z.string().nonempty(),
  meta: MetaSchema.optional(),
  next: z.string().nonempty().optional(),
})

export const ResourceSchema: z.ZodType<Resource> = z.object({
  // biome-ignore lint/suspicious/noExplicitAny: reason
  // attributes: z.array(z.any()),
  href: z.string().nonempty().optional(),
  // id: z.coerce.number().int().positive(),
  meta: MetaSchema.optional(),
  relationships: z.record(SearchCatalogResources.TypeSchema, RelationshipSchema).optional(),
  type: z.string().nonempty(),
  views: z.lazy(() => z.array(ViewSchema)).optional(),
})

export namespace SearchCatalogResources {
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

  export const ParamSchema = z.object({
    storefront: z.enum(['jp']),
  })

  export const QuerySchema = z.object({
    l: z.enum(['ja']).optional(),
    limit: z.number().int().positive().max(25).optional().default(5),
    offset: z.number().int().min(0).optional().default(0),
    term: z.string().nonempty().optional(),
    types: z.array(TypeSchema).nonempty(),
    with: z.array(z.enum(['topResults'])).optional(),
  })

  export const ResponseSchema = z.object({
    results: z.record(TypeSchema, ViewSchema.optional()),
  })
  // .strict()
}

export namespace GetCatalogAlbum {
  export const ViewType = z.enum(['appears-on', 'other-versions', 'related-albums', 'related-videos'])

  export const ParamSchema = z.object({
    id: z.coerce.number().int().positive(),
    storefront: z.enum(['jp']),
  })

  export const QuerySchema = z.object({
    extend: z.array(z.string()).optional(),
    include: z.array(z.string()).nonempty().optional(),
    l: z.enum(['ja']).optional(),
    views: z.array(ViewType).nonempty().optional(),
  })

  export const ResponseSchema = z.object({})
}

export namespace GetCatalogArtist {
  export const ViewType = z.enum([
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
    storefront: z.enum(['jp']),
  })

  export const QuerySchema = z.object({
    extend: z.array(z.string()).optional(),
    include: z.array(z.string()).nonempty().optional(),
    l: z.enum(['ja']).optional(),
    views: z.array(ViewType).nonempty().optional(),
  })

  export const ResponseSchema = z.object({})
}
