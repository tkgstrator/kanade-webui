import z from "zod"

export const ArtistParamSchema = z.object({
  artist_id: z.coerce.number().int().positive(),
})
