import { createRoute, OpenAPIHono as Hono } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { HTTPException } from 'hono/http-exception'
import { timeout } from 'hono/timeout'
import { pinoLogger } from 'hono-pino'
import pino from 'pino'
import { isTokenExpired, signToken } from './lib/token'
import {
  CatalogSchema,
  GetCatalogAlbum,
  GetCatalogArtist,
  GetCatalogCharts,
  SearchCatalogResources,
  TypeSchema,
  VersionResponseSchema,
} from './schemas/common.dto'
import { QueueBodySchema, QueueResponseSchema } from './schemas/queue.dto'
import type { Env } from './utils/binding'
import { createClient } from './utils/client'

const app = new Hono<Env>()

app.use(pinoLogger({
  http: {
    onResLevel: (c) => {
      if (c.res.status >= 500) return 'error'
      if (c.res.status >= 400) return 'warn'
      return 'info'
    },
  },
  pino: pino({ level: 'info' }),
}))
app.openapi(
  createRoute({
    description: 'Returns the current application version, git hash, and build timestamp.',
    method: 'get',
    middleware: [],
    path: '/api/version',
    responses: {
      200: {
        content: {
          'application/json': {
            schema: VersionResponseSchema,
          },
        },
        description: 'Current version info',
      },
    },
    summary: 'Get app version',
    tags: ['System'],
  }),
  (c) => {
    return c.json({
      buildAt: __BUILD_AT__,
      hash: __GIT_HASH__,
      version: __APP_VERSION__,
    })
  },
)

app.use(timeout(5 * 1000)) // 5 seconds
app.use(contextStorage())
app.use(async (c: Context<Env>, next) => {
  const token = c.get('MUSIC_TOKEN')

  if (token === undefined || isTokenExpired(token)) {
    const token = await signToken(c.env)
    c.set('MUSIC_TOKEN', token)
    c.set('CLIENT', createClient(token))
  }

  await next()
})

app.openapi(
  createRoute({
    description: 'Retrieves chart data (top albums, top songs) from the Apple Music catalog.',
    method: 'get',
    middleware: [],
    path: '/api/charts',
    request: {
      query: GetCatalogCharts.QuerySchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: GetCatalogCharts.ResponseSchema,
          },
        },
        description: 'Successful response with chart data',
      },
    },
    summary: 'Get catalog charts',
    tags: ['Charts'],
  }),
  async (c) => {
    const { chart, limit, types } = c.req.valid('query')
    const response = await c.var.CLIENT.get('/v1/catalog/:storefront/charts', {
      params: { storefront: 'jp' },
      queries: {
        limit: limit ?? 25,
        types,
        ...(chart ? { chart } : {}),
      },
    })
    return c.json(response)
  },
)

app.openapi(
  createRoute({
    description:
      "Searches the Apple Music catalog for songs, albums, artists, and playlists matching the query parameter 'q'.",
    method: 'get',
    middleware: [],
    path: '/api/search',
    request: {
      query: SearchCatalogResources.QuerySchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: SearchCatalogResources.ResponseSchema,
          },
        },
        description: 'Successful response with search results',
      },
      404: {
        description: 'Not Found',
      },
    },
    summary: 'Search the Apple Music catalog',
    tags: ['Search'],
  }),
  async (c) => {
    const { term } = c.req.valid('query')
    const response = await c.var.CLIENT.get('/v1/catalog/jp/search', {
      queries: {
        limit: 25,
        term: term,
        types: TypeSchema.options,
      },
    })
    return c.json(response)
  },
)

app.openapi(
  createRoute({
    description: 'Retrieves detailed information about a specific album by its ID.',
    method: 'get',
    middleware: [],
    path: '/api/albums/:id',
    request: {
      params: GetCatalogAlbum.ParamSchema,
      query: GetCatalogAlbum.QuerySchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: CatalogSchema,
          },
        },
        description: 'Successful response with album details',
      },
    },
    summary: 'Get album details by ID',
    tags: ['Albums'],
  }),
  async (c) => {
    const { id, storefront } = c.req.valid('param')
    const response = await c.var.CLIENT.get('/v1/catalog/:storefront/albums/:id', {
      params: { id, storefront },
    })
    return c.json(response)
  },
)

app.openapi(
  createRoute({
    description: 'Retrieves detailed information about a specific album by its ID.',
    method: 'get',
    middleware: [],
    path: '/api/artists/:id',
    request: {
      params: GetCatalogArtist.ParamSchema,
      query: GetCatalogArtist.QuerySchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: CatalogSchema,
          },
        },
        description: 'Successful response with album details',
      },
    },
    summary: 'Get album details by ID',
    tags: ['Albums'],
  }),
  async (c) => {
    const { id, storefront } = c.req.valid('param')
    c.req.valid('query')
    const response = await c.var.CLIENT.get('/v1/catalog/:storefront/artists/:id', {
      params: { id, storefront },
      queries: {
        include: ['albums'],
      },
    })
    return c.json(response)
  },
)

app.openapi(
  createRoute({
    description: 'Retrieves detailed information about a specific album by its ID.',
    method: 'post',
    middleware: [],
    path: '/api/queues',
    request: {
      body: {
        content: {
          'application/json': {
            schema: QueueBodySchema,
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: QueueResponseSchema,
          },
        },
        description: 'Successful response with album details',
      },
    },
    summary: 'Get album details by ID',
    tags: ['Queues'],
  }),
  async (c) => {
    const body = c.req.valid('json')
    const url: URL = new URL('/api/queues', c.env.PROXY_URL)
    const response = await fetch(url.href, {
      body: JSON.stringify(body),
      headers: {
        'CF-Access-Client-Id': c.env.CF_ACCESS_CLIENT_ID,
        'CF-Access-Client-Secret': c.env.CF_ACCESS_CLIENT_SECRET,
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    if (!response.ok) {
      throw new HTTPException(500, {
        message: response.statusText,
      })
    }
    return c.json(response)
  },
)

app.onError(async (error, c) => {
  const logger = c.var.logger
  if (error instanceof HTTPException) {
    logger.error({ status: error.status }, 'HTTPException')
    return c.json({ message: error.message }, error.status)
  }
  if (error.name === 'ZodError') {
    logger.warn({ cause: error.cause }, 'ZodError')
    return c.json({ description: error.cause, message: JSON.parse(error.message) }, 400)
  }
  logger.error({ err: error }, 'UnhandledError')
  const cause = error.cause instanceof Error ? error.cause : undefined
  return c.json({ message: cause ? JSON.parse(cause.message) : error.message }, 500)
})

export default app
