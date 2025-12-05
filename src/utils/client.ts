import { makeApi, Zodios } from '@zodios/core'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { CatalogSchema } from '@/schemas/schema/common.dto'

const definition = makeApi([
  {
    description: 'Get album details by ID',
    method: 'get',
    parameters: [
      {
        name: 'id',
        schema: z.coerce.number().int().positive(),
        type: 'Path',
      },
      {
        name: 'storefront',
        schema: z.enum(['jp', 'us']).optional().default('jp'),
        type: 'Path',
      },
    ],
    path: '/v1/catalog/:storefront/albums/:id',
    response: CatalogSchema,
  },
  {
    description: 'Get artist details by ID',
    method: 'get',
    parameters: [
      {
        name: 'id',
        schema: z.coerce.number().int().positive(),
        type: 'Path',
      },
      {
        name: 'storefront',
        schema: z.enum(['jp', 'us']).optional().default('jp'),
        type: 'Path',
      },
      {
        name: 'include',
        schema: z.array(z.string()).nonempty().optional(),
        type: 'Query',
      },
    ],
    path: '/v1/catalog/:storefront/artists/:id',
    response: CatalogSchema,
  },
])

export type ZodiosDefinition = typeof definition

export const createClient = (token: string) => {
  const client = new Zodios('https://api.music.apple.com', definition, {
    axiosConfig: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })
  client.use({
    error: (api, config, error) => {
      console.error(JSON.parse(error.message))
      throw new HTTPException(400, { message: error.message })
    },
    name: 'OnError',
  })
  return client
}
