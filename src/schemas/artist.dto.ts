import z from "zod"

export const ArtistParamSchema = z.object({
  artist_id: z.coerce.number().int().positive(),
})

export const ArtworkSchema = z.object({
  bgColor: z.string(),
  height: z.number(),
  textColor1: z.string(),
  textColor2: z.string(),
  textColor3: z.string(),
  textColor4: z.string(),
  url: z.string(),
  width: z.number(),
})
export type Artwork = z.infer<typeof ArtworkSchema>

export const EditorialNotesSchema = z.object({
  short: z.string(),
  standard: z.string().optional(),
  tagline: z.string().optional(),
})
export type EditorialNotes = z.infer<typeof EditorialNotesSchema>

export const PurplePlayParamsSchema = z.object({
  id: z.string(),
  kind: z.string(),
})
export type PurplePlayParams = z.infer<typeof PurplePlayParamsSchema>

export const FluffyPlayParamsSchema = z.object({
  format: z.string(),
  hasDrm: z.boolean(),
  id: z.string(),
  kind: z.string(),
  mediaType: z.number(),
  stationHash: z.string(),
})
export type FluffyPlayParams = z.infer<typeof FluffyPlayParamsSchema>

export const PurpleAttributesSchema = z.object({
  artwork: ArtworkSchema,
  genreNames: z.array(z.string()),
  name: z.string(),
  url: z.string(),
})
export type PurpleAttributes = z.infer<typeof PurpleAttributesSchema>

export const FluffyAttributesSchema = z.object({
  artistName: z.string(),
  artwork: ArtworkSchema,
  copyright: z.string().optional(),
  editorialNotes: EditorialNotesSchema.optional(),
  genreNames: z.array(z.string()),
  isCompilation: z.boolean().optional(),
  isComplete: z.boolean().optional(),
  isMasteredForItunes: z.boolean().optional(),
  isSingle: z.boolean().optional(),
  name: z.string(),
  playParams: PurplePlayParamsSchema,
  recordLabel: z.string().optional(),
  releaseDate: z.string(),
  trackCount: z.number().optional(),
  upc: z.string().optional(),
  url: z.string(),
})
export type FluffyAttributes = z.infer<typeof FluffyAttributesSchema>

export const TentacledAttributesSchema = z.object({
  artwork: ArtworkSchema,
  isLive: z.boolean(),
  mediaKind: z.string(),
  name: z.string(),
  playParams: FluffyPlayParamsSchema,
  url: z.string(),
})
export type TentacledAttributes = z.infer<typeof TentacledAttributesSchema>

export const AlbumsDatumSchema = z.object({
  attributes: FluffyAttributesSchema,
  href: z.string(),
  id: z.string(),
  type: z.string(),
})
export type AlbumsDatum = z.infer<typeof AlbumsDatumSchema>

export const StationDatumSchema = z.object({
  attributes: TentacledAttributesSchema,
  href: z.string(),
  id: z.string(),
  type: z.string(),
})
export type StationDatum = z.infer<typeof StationDatumSchema>

export const AlbumsSchema = z.object({
  data: z.array(AlbumsDatumSchema),
  href: z.string(),
})
export type Albums = z.infer<typeof AlbumsSchema>

export const StationSchema = z.object({
  data: z.array(StationDatumSchema),
  href: z.string(),
})
export type Station = z.infer<typeof StationSchema>

export const RelationshipsSchema = z.object({
  albums: AlbumsSchema,
  "music-videos": AlbumsSchema,
  station: StationSchema,
})
export type Relationships = z.infer<typeof RelationshipsSchema>

export const ArtistDatumSchema = z.object({
  attributes: PurpleAttributesSchema,
  href: z.string(),
  id: z.string(),
  relationships: RelationshipsSchema,
  type: z.string(),
})
export type ArtistDatum = z.infer<typeof ArtistDatumSchema>

export const ArtistSchema = z.object({
  data: z.array(ArtistDatumSchema),
})
export type Artist = z.infer<typeof ArtistSchema>
