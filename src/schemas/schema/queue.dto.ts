import z from 'zod'

export const QueueParamSchema = z.object({
  album_id: z.coerce.number().int(),
})

export const QueueQuerySchema = z.object({
  overwrite: z.coerce.boolean().optional().default(false),
})

export const QueueResponseSchema = z.object({})

export const QueueBodySchema = z.object({
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
