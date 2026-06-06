import z from 'zod'

export const QueueParamSchema = z
  .object({
    album_id: z.coerce.number().int(),
  })
  .openapi('QueueParam')

export const QueueQuerySchema = z
  .object({
    overwrite: z.coerce.boolean().optional().default(false),
  })
  .openapi('QueueQuery')

export const QueueResponseSchema = z.object({}).openapi('QueueResponse')

export const QueueBodySchema = z
  .object({
    album_id: z.coerce.number().int().optional(),
    artist_id: z.coerce.number().int().optional(),
    options: z
      .object({
        overwrite: z.coerce.boolean().optional().default(false),
      })
      .optional()
      .default({
        overwrite: true,
      }),
  })
  .refine((body) => (body.album_id === undefined) !== (body.artist_id === undefined), {
    message: 'exactly one of album_id or artist_id is required',
  })
  .openapi('QueueBody')
