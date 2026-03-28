# スキル: API エンドポイント追加

新しい API エンドポイントをプロジェクトに追加する手順。

## 手順

### 1. スキーマ定義 (`src/schemas/common.dto.ts`)

```typescript
export namespace GetCatalogXxx {
  export const ParamSchema = z.object({
    id: z.coerce.number().int().positive(),
    storefront: z.enum(['jp']).optional().default('jp'),
  })

  export const QuerySchema = z.object({
    include: z.array(z.string()).nonempty().optional(),
    l: z.enum(['ja']).optional().default('ja'),
  })
}
```

### 2. Hono ルート定義 (`src/index.ts`)

```typescript
app.openapi(
  createRoute({
    description: 'エンドポイントの説明',
    method: 'get',
    middleware: [],
    path: '/api/xxx/:id',
    request: {
      params: GetCatalogXxx.ParamSchema,
      query: GetCatalogXxx.QuerySchema,
    },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: CatalogSchema,
          },
        },
        description: 'Successful response',
      },
    },
    summary: 'エンドポイントの概要',
    tags: ['タグ名'],
  }),
  async (c) => {
    const { id, storefront } = c.req.valid('param')
    const response = await c.var.CLIENT.get('/v1/catalog/:storefront/xxx/:id', {
      params: { id, storefront },
    })
    return c.json(response)
  },
)
```

### 3. Zodios クライアント定義 (`src/utils/client.ts`)

```typescript
{
  description: 'xxx の詳細を取得',
  method: 'get',
  parameters: [
    { name: 'id', schema: z.coerce.number().int().positive(), type: 'Path' },
    { name: 'storefront', schema: z.enum(['jp', 'us']).optional().default('jp'), type: 'Path' },
  ],
  path: '/v1/catalog/:storefront/xxx/:id',
  response: CatalogSchema,
},
```

### 4. フロントエンドクライアント (`src/lib/client.ts`)

`bun run generate` で自動生成する（手動編集不可）。

## チェックリスト

- [ ] `src/schemas/common.dto.ts` にスキーマを追加
- [ ] `src/index.ts` に `openapi` ルートを追加
- [ ] `src/utils/client.ts` に Zodios 定義を追加
- [ ] `bun run build` でビルドエラーがないことを確認

## 共通ルール

- CLI コマンドは `npx` ではなく `bunx` を使う
- 日付操作は `new Date()` ではなく `dayjs` を使う
