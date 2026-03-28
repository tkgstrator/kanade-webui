import { makeApi, Zodios } from '@zodios/core'
import { HTTPException } from 'hono/http-exception'
import { z } from 'zod'
import { CatalogSchema, SearchCatalogResources, TypeSchema } from '@/schemas/common.dto'

const definition = makeApi([
  {
    description: 'Search the Apple Music catalog',
    method: 'get',
    parameters: [
      {
        name: 'term',
        schema: z.string().nonempty(),
        type: 'Query',
      },
      {
        name: 'types',
        schema: TypeSchema.array().nonempty().optional(),
        type: 'Query',
      },
      {
        name: 'limit',
        schema: z.number().int().positive().max(25).optional().default(25),
        type: 'Query',
      },
    ],
    path: '/v1/catalog/jp/search',
    response: SearchCatalogResources.ResponseSchema,
  },
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
        schema: z
          .array(z.string())
          .nonempty()
          .optional()
          .transform((v) => (v === undefined ? undefined : v.join(',')))
          .pipe(z.string().optional()),
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
    error: (_api, _config, error) => {
      console.error(error.message)
      throw new HTTPException(400, { message: error.message })
    },
    name: 'OnError',
  })
  return client
}
