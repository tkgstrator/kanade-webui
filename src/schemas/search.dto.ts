import { z } from "@hono/zod-openapi"

export const SearchQuerySchema = z.object({
  q: z.string().nonempty().describe("The search query string."),
})

const MetaResultsSchema = z
  .object({
    order: z.array(z.string()),
    rawOrder: z.array(z.string()),
  })
  .openapi("MetaResults")
export type MetaResults = z.infer<typeof MetaResultsSchema>

export const ArtworkSchema = z
  .object({
    bgColor: z.string(),
    height: z.number(),
    textColor1: z.string(),
    textColor2: z.string(),
    textColor3: z.string(),
    textColor4: z.string(),
    url: z.string(),
    width: z.number().int().positive(),
  })
  .openapi("Artwork")
export type Artwork = z.infer<typeof ArtworkSchema>

export const EditorialNotesSchema = z
  .object({
    standard: z.string().optional(),
  })
  .openapi("EditorialNotes")
export type EditorialNotes = z.infer<typeof EditorialNotesSchema>

export const PlayParamsSchema = z
  .object({
    id: z.coerce.number().int().positive(),
    kind: z.string(),
  })
  .openapi("PlayParams")
export type PlayParams = z.infer<typeof PlayParamsSchema>

export const PreviewSchema = z
  .object({
    url: z.string(),
  })
  .openapi("Preview")
export type Preview = z.infer<typeof PreviewSchema>

export const ArtistAttributesSchema = z
  .object({
    artwork: ArtworkSchema.optional(),
    genreNames: z.array(z.string()),
    name: z.string(),
    url: z.string(),
  })
  .openapi("ArtistAttributes")
export type ArtistAttributes = z.infer<typeof ArtistAttributesSchema>

export const MetaSchema = z
  .object({
    results: MetaResultsSchema,
  })
  .openapi("Meta")
export type Meta = z.infer<typeof MetaSchema>

export const AlbumAttributesSchema = z
  .object({
    albumName: z.string().optional(),
    artistName: z.string(),
    artwork: ArtworkSchema,
    composerName: z.string().optional(),
    contentRating: z.string().optional(),
    copyright: z.string().optional(),
    discNumber: z.number().optional(),
    durationInMillis: z.number().optional(),
    editorialNotes: EditorialNotesSchema.optional(),
    genreNames: z.array(z.string()),
    hasLyrics: z.boolean().optional(),
    isAppleDigitalMaster: z.boolean().optional(),
    isCompilation: z.boolean().optional(),
    isComplete: z.boolean().optional(),
    isMasteredForItunes: z.boolean().optional(),
    isrc: z.string().optional(),
    isSingle: z.boolean().optional(),
    name: z.string(),
    playParams: PlayParamsSchema,
    previews: z.array(PreviewSchema).optional(),
    recordLabel: z.string().optional(),
    releaseDate: z.string(),
    trackCount: z.number().optional(),
    trackNumber: z.number().optional(),
    upc: z.string().optional(),
    url: z.string(),
  })
  .openapi("AlbumAttributes")
export type AlbumAttributes = z.infer<typeof AlbumAttributesSchema>

export const DatumSchema = z
  .object({
    href: z.string(),
    id: z.coerce.number().int().positive(),
    type: z.string(),
  })
  .openapi("SongsDatum")

export const AlbumsDatumSchema = DatumSchema.extend({
  attributes: AlbumAttributesSchema,
}).openapi("AlbumsDatum")
export type AlbumsDatum = z.infer<typeof AlbumsDatumSchema>

export const SongsDatumSchema = DatumSchema.extend({
  attributes: AlbumAttributesSchema.optional(),
}).openapi("SongsDatum")
export type SongsDatum = z.infer<typeof SongsDatumSchema>

export const SongsSchema = z
  .object({
    data: z.array(SongsDatumSchema),
    href: z.string(),
    next: z.string().optional(),
  })
  .openapi("Songs")
export type Songs = z.infer<typeof SongsSchema>

export const AlbumsSchema = z
  .object({
    data: z.array(AlbumsDatumSchema),
    href: z.string(),
  })
  .openapi("Albums")
export type Albums = z.infer<typeof AlbumsSchema>

export const RelationshipsSchema = z
  .object({
    albums: SongsSchema,
  })
  .openapi("Relationships")
export type Relationships = z.infer<typeof RelationshipsSchema>

export const ArtistsDatumSchema = z
  .object({
    attributes: ArtistAttributesSchema,
    href: z.string(),
    id: z.coerce.number().int().positive(),
    relationships: RelationshipsSchema,
    type: z.string(),
  })
  .openapi("ArtistsDatum")
export type ArtistsDatum = z.infer<typeof ArtistsDatumSchema>

export const ArtistsSchema = z
  .object({
    data: z.array(ArtistsDatumSchema),
    href: z.string(),
  })
  .openapi("Artists")
export type Artists = z.infer<typeof ArtistsSchema>

export const ResultResultsSchema = z
  .object({
    albums: AlbumsSchema.optional(),
    artists: ArtistsSchema.optional(),
    songs: SongsSchema.optional(),
  })
  .openapi("ResultResults")
export type ResultResults = z.infer<typeof ResultResultsSchema>

export const SearchSchema = z
  .object({
    meta: MetaSchema,
    results: ResultResultsSchema,
  })
  .openapi("Search")
export type Search = z.infer<typeof SearchSchema>
