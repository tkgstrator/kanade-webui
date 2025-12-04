import { z } from "@hono/zod-openapi"

export const QueueSchema = z.object({
  data: z.object({
    url: z.url(),
  }),
  id: z.coerce.number().int().positive(),
  timestamp: z.number().int().positive(),
})
