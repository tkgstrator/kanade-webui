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
    album_id: z.coerce.number().int(),
    options: z
      .object({
        overwrite: z.coerce.boolean().optional().default(false),
      })
      .optional()
      .default({
        overwrite: true,
      }),
  })
  .openapi('QueueBody')
