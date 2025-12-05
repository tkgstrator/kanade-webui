import { createRoute, OpenAPIHono as Hono } from '@hono/zod-openapi'
import type { Context } from 'hono'
import { contextStorage } from 'hono/context-storage'
import { HTTPException } from 'hono/http-exception'
import { logger } from 'hono/logger'
import { timeout } from 'hono/timeout'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { isTokenExpired, signToken } from './lib/token'
import { CatalogSchema, GetCatalogAlbum, GetCatalogArtist, SearchCatalogResources } from './schemas/schema/common.dto'
import type { Env } from './utils/binding'

const app = new Hono<Env>({
  defaultHook: (result) => {
    if (!result.success) {
      console.error(result.error)
      throw result.error
    }
  },
})

app.onError(async (error, c) => {
  console.error(error)
  if (error instanceof HTTPException) {
    return c.json({ message: JSON.parse(error.message) }, error.status)
  }
  if (error.name === 'ZodError') {
    return c.json({ description: error.cause, message: JSON.parse(error.message) }, 400)
  }
  return c.json({ message: error.message }, 500)
})
app.use(logger())
app.use(timeout(5 * 1000)) // 5 seconds
app.use(contextStorage())
app.use(async (c: Context<Env>, next) => {
  const token = c.get('MUSIC_TOKEN')
  if (token === undefined) {
    c.set('MUSIC_TOKEN', await signToken(c.env))
    await next()
    return
  }
  if (isTokenExpired(token)) {
    c.set('MUSIC_TOKEN', await signToken(c.env))
  }
  await next()
})
app.openapi(
  createRoute({
    description:
      "Searches the Apple Music catalog for songs, albums, artists, and playlists matching the query parameter 'q'.",
    method: 'get',
    middleware: [],
    path: '/api/search',
    request: {
      params: SearchCatalogResources.ParamSchema,
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
    const { q } = c.req.valid('query')
    const url: URL = new URL('https://api.music.apple.com/v1/catalog/jp/search')
    url.searchParams.append('term', q)
    url.searchParams.append(
      'types',
      [
        'activities',
        'albums',
        'apple-curators',
        'artists',
        'curators',
        'music-videos',
        'playlists',
        'songs',
        'stations',
      ].join(','),
    )
    url.searchParams.append('limit', '25')
    const response = await fetch(url.href, {
      headers: {
        Authorization: `Bearer ${c.get('MUSIC_TOKEN')}`,
      },
    })
    if (!response.ok) {
      throw new HTTPException(response.status as ContentfulStatusCode, {
        message: response.statusText,
      })
    }
    const object = await response.json()
    const result = SearchCatalogResources.ResponseSchema.safeParse(object)
    if (!result.success) {
      console.error(object, result.error)
      throw new HTTPException(501, { message: result.error.message })
    }
    return c.json(result.data)
  },
)
app.openapi(
  createRoute({
    description: 'Retrieves detailed information about a specific album by its ID.',
    method: 'get',
    middleware: [],
    path: '/api/albums/:album_id',
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
    const { id } = c.req.valid('param')
    const url: URL = new URL(`https://api.music.apple.com/v1/catalog/jp/albums/${id}`)
    url.searchParams.append('include', 'tracks')
    const response = await fetch(url.href, {
      headers: {
        Authorization: `Bearer ${c.get('MUSIC_TOKEN')}`,
      },
    })
    if (!response.ok) {
      throw new HTTPException(response.status as ContentfulStatusCode, {
        message: response.statusText,
      })
    }
    const object = await response.json()
    // return c.json(object)
    const result = CatalogSchema.safeParse(object)
    if (!result.success) {
      console.error(object, result.error)
      throw new HTTPException(502, { message: result.error.message })
    }
    return c.json(result.data)
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
    const { id } = c.req.valid('param')
    const url: URL = new URL(`https://api.music.apple.com/v1/catalog/jp/artists/${id}`)
    url.searchParams.append('include', 'albums,music-videos,station')
    const response = await fetch(url.href, {
      headers: {
        Authorization: `Bearer ${c.get('MUSIC_TOKEN')}`,
      },
    })
    if (!response.ok) {
      throw new HTTPException(response.status as ContentfulStatusCode, {
        message: response.statusText,
      })
    }
    const object = await response.json()
    // return c.json(object)
    const result = CatalogSchema.safeParse(object)
    if (!result.success) {
      console.error(object, result.error)
      throw new HTTPException(502, { message: result.error.message })
    }
    return c.json(result.data)
  },
)
// app.openapi(
//   createRoute({
//     description: '',
//     method: 'get',
//     middleware: [],
//     path: '/api/charts',
//     request: {
//       query: ChartQuerySchema,
//     },
//     responses: {
//       200: {
//         content: {
//           'application/json': {
//             schema: ChartSchema,
//           },
//         },
//         description: 'Successful response with album details',
//       },
//     },
//     summary: '',
//     tags: ['Charts'],
//   }),
//   async (c) => {
//     const { types, genre, limit } = c.req.valid('query')
//     const url: URL = new URL('https://api.music.apple.com/v1/catalog/jp/charts')
//     url.searchParams.append('types', types)
//     url.searchParams.append('genre', genre.toString())
//     url.searchParams.append('limit', limit.toString())
//     const response = await fetch(url.href, {
//       headers: {
//         Authorization: `Bearer ${c.get('MUSIC_TOKEN')}`,
//       },
//     })
//     if (!response.ok) {
//       throw new HTTPException(response.status as ContentfulStatusCode, {
//         message: response.statusText,
//       })
//     }
//     const object = await response.json()
//     return c.json(object)
//     const result = ChartSchema.safeParse(object)
//     if (!result.success) {
//       console.error(object, result.error)
//       throw new HTTPException(502, { message: result.error.message })
//     }
//     return c.json(result.data)
//   },
// )
// app.openapi(
//   createRoute({
//     description: 'Retrieves detailed information about a specific album by its ID.',
//     method: 'get',
//     middleware: [],
//     path: '/api/queues/:album_id',
//     request: {
//       params: AlbumSearchParamSchema,
//     },
//     responses: {
//       201: {
//         content: {
//           'application/json': {
//             schema: QueueSchema,
//           },
//         },
//         description: 'Successful response with album details',
//       },
//       404: {
//         description: 'Not Found',
//       },
//     },
//     summary: 'Add A Download Album Queue to Redis',
//     tags: ['Albums'],
//   }),
//   async (c) => {
//     const { album_id } = c.req.valid('param')
//     const url: URL = new URL('/api/queues', c.env.PROXY_URL)
//     // キューに保存するデータのために今後はURL以外も保存しておきたい所存
//     const response = await fetch(url.href, {
//       body: JSON.stringify({
//         url: `https://music.apple.com/jp/album/${album_id}`,
//       }),
//       headers: {
//         'CF-Access-Client-Id': c.env.CF_ACCESS_CLIENT_ID,
//         'CF-Access-Client-Secret': c.env.CF_ACCESS_CLIENT_SECRET,
//         'Content-Type': 'application/json',
//       },
//       method: 'POST',
//     })
//     if (!response.ok) {
//       throw new HTTPException(response.status as ContentfulStatusCode, {
//         message: response.statusText,
//       })
//     }
//     const object = await response.json()
//     const result = QueueSchema.safeParse(object)
//     if (!result.success) {
//       console.error(object, result.error)
//       throw new HTTPException(502, { message: result.error.message })
//     }
//     return c.json(result.data, 201)
//   },
// )

export default app
