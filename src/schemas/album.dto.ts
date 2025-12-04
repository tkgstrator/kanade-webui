import { z } from "@hono/zod-openapi"

export const AlbumSearchParamSchema = z.object({
  album_id: z.coerce.number().describe("The unique identifier for the album."),
})

export const ArtworkSchema = z.object({
  bgColor: z.string(),
  height: z.number(),
  textColor1: z.string(),
  textColor2: z.string(),
  textColor3: z.string(),
  textColor4: z.string(),
  url: z.string(),
  width: z.number().int().positive(),
})
export type Artwork = z.infer<typeof ArtworkSchema>

export const PlayParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
  kind: z.string(),
})
export type PlayParams = z.infer<typeof PlayParamsSchema>

export const PreviewSchema = z.object({
  url: z.string(),
})
export type Preview = z.infer<typeof PreviewSchema>

export const PurpleAttributesSchema = z.object({
  artistName: z.string(),
  artwork: ArtworkSchema,
  copyright: z.string(),
  genreNames: z.array(z.string()),
  isCompilation: z.boolean(),
  isComplete: z.boolean(),
  isMasteredForItunes: z.boolean(),
  isSingle: z.boolean(),
  name: z.string(),
  playParams: PlayParamsSchema,
  recordLabel: z.string(),
  releaseDate: z.string(),
  trackCount: z.number(),
  upc: z.string(),
  url: z.string(),
})
export type PurpleAttributes = z.infer<typeof PurpleAttributesSchema>

export const FluffyAttributesSchema = z.object({
  albumName: z.string(),
  artistName: z.string(),
  artwork: ArtworkSchema,
  composerName: z.string().optional(),
  discNumber: z.number(),
  durationInMillis: z.number().optional(),
  genreNames: z.array(z.string()),
  hasLyrics: z.boolean(),
  isAppleDigitalMaster: z.boolean(),
  isrc: z.string(),
  name: z.string(),
  playParams: PlayParamsSchema.optional(),
  previews: z.array(PreviewSchema),
  releaseDate: z.string().optional(),
  trackNumber: z.number(),
  url: z.string(),
})
export type FluffyAttributes = z.infer<typeof FluffyAttributesSchema>

export const ArtistsDatumSchema = z.object({
  attributes: FluffyAttributesSchema.optional(),
  href: z.string(),
  id: z.coerce.number().int().positive(),
  type: z.string(),
})
export type ArtistsDatum = z.infer<typeof ArtistsDatumSchema>

export const ArtistsSchema = z.object({
  data: z.array(ArtistsDatumSchema),
  href: z.string(),
})
export type Artists = z.infer<typeof ArtistsSchema>

export const RelationshipsSchema = z.object({
  artists: ArtistsSchema,
  tracks: ArtistsSchema,
})
export type Relationships = z.infer<typeof RelationshipsSchema>

export const AlbumSearchDatumSchema = z.object({
  attributes: PurpleAttributesSchema,
  href: z.string(),
  id: z.coerce.number().int().positive(),
  relationships: RelationshipsSchema,
  type: z.string(),
})
export type AlbumSearchDatum = z.infer<typeof AlbumSearchDatumSchema>

export const AlbumSearchSchema = z.object({
  data: z.array(AlbumSearchDatumSchema).nonempty(),
})
export type AlbumSearch = z.infer<typeof AlbumSearchSchema>
