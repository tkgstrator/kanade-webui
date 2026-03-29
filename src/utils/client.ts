import { z } from '@hono/zod-openapi'
import { makeApi, Zodios } from '@zodios/core'
import { HTTPException } from 'hono/http-exception'
import { CatalogSchema, ChartTypeSchema, GetCatalogCharts, SearchCatalogResources, TypeSchema } from '@/schemas/common.dto'

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
  {
    description: 'Get catalog charts',
    method: 'get',
    parameters: [
      {
        name: 'storefront',
        schema: z.enum(['jp', 'us']).optional().default('jp'),
        type: 'Path',
      },
      {
        name: 'types',
        schema: ChartTypeSchema.array().nonempty()
          .transform((v) => v.join(','))
          .pipe(z.string()),
        type: 'Query',
      },
      {
        name: 'limit',
        schema: z.number().int().positive().max(200).optional().default(25),
        type: 'Query',
      },
      {
        name: 'chart',
        schema: z.string().nonempty().optional(),
        type: 'Query',
      },
    ],
    path: '/v1/catalog/:storefront/charts',
    response: GetCatalogCharts.ResponseSchema,
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
      console.error('[AppleMusicAPI] error', { message: error.message })
      throw new HTTPException(400, { message: error.message })
    },
    name: 'OnError',
    request: async (_api, config) => {
      console.debug('[AppleMusicAPI] request', { method: config.method, url: config.url })
      return config
    },
    response: async (_api, _config, response) => {
      console.debug('[AppleMusicAPI] response', { status: response.status, url: response.config.url })
      return response
    },
  })
  return client
}
