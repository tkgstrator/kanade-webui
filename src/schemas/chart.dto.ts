import { z } from "@hono/zod-openapi"

export const ChartQuerySchema = z.object({
  genre: z.coerce.number().int().positive(),
  limit: z.coerce.number().int().positive().max(100).default(25),
  types: z.enum(["albums", "songs", "music-videos"]),
})

export const MetaResultsSchema = z.object({
  order: z.array(z.string()),
})
export type MetaResults = z.infer<typeof MetaResultsSchema>

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
  short: z.string().nonempty().optional(),
  standard: z.string().optional(),
  tagline: z.string().optional(),
})
export type EditorialNotes = z.infer<typeof EditorialNotesSchema>

export const PlayParamsSchema = z.object({
  id: z.string(),
  kind: z.string(),
})
export type PlayParams = z.infer<typeof PlayParamsSchema>

export const MetaSchema = z.object({
  results: MetaResultsSchema,
})
export type Meta = z.infer<typeof MetaSchema>

export const AttributesSchema = z.object({
  artistName: z.string(),
  artwork: ArtworkSchema,
  copyright: z.string().nonempty().optional(),
  editorialNotes: EditorialNotesSchema.optional(),
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
export type Attributes = z.infer<typeof AttributesSchema>

export const DatumSchema = z.object({
  attributes: AttributesSchema,
  href: z.string(),
  id: z.string(),
  type: z.string(),
})
export type Datum = z.infer<typeof DatumSchema>

export const AlbumSchema = z.object({
  chart: z.string(),
  data: z.array(DatumSchema),
  href: z.string(),
  name: z.string(),
  next: z.string(),
  orderId: z.string(),
})
export type Album = z.infer<typeof AlbumSchema>

export const ChartResultsSchema = z.object({
  albums: z.array(AlbumSchema),
})
export type ChartResults = z.infer<typeof ChartResultsSchema>

export const ChartSchema = z.object({
  meta: MetaSchema,
  results: ChartResultsSchema,
})
export type Chart = z.infer<typeof ChartSchema>
