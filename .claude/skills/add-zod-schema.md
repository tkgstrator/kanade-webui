# スキル: Zod スキーマ追加

Apple Music API のレスポンスに対応する Zod スキーマを `src/schemas/common.dto.ts` に追加する手順。

## 重要な注意事項

- `import { z } from '@hono/zod-openapi'` を使う（`zod` の直接インポートではない）
- `z.string().nonempty()` を使う（空文字列バリデーション）
- 日付フィールドは `z.coerce.date()` でパースする
- ID は `z.coerce.number().int().positive()` で数値に変換する

## パターン別の書き方

### Attribute スキーマ (namespace Attribute 内)

```typescript
namespace Attribute {
  export const XxxSchema = z.object({
    artwork: ArtworkSchema,
    name: z.string().nonempty(),
    url: z.url(),
    // オプションフィールド
    description: z.string().nonempty().optional(),
  })
}
```

### Request スキーマ (namespace として)

```typescript
export namespace GetCatalogXxx {
  export const ParamSchema = z.object({
    id: z.coerce.number().int().positive(),
    storefront: z.enum(['jp']).optional().default('jp'),
  })

  export const QuerySchema = z.object({
    include: z.array(z.string()).nonempty().optional(),
    l: z.enum(['ja']).optional().default('ja'),
    views: z.array(ViewType).nonempty().optional(),
  })

  export const ResponseSchema = z.object({
    data: DatumSchema.extend({
      attributes: Attribute.XxxSchema,
      id: z.coerce.number().int().positive(),
      relationships: RelationshipSchema,
    })
      .array()
      .nonempty(),
  })
}
```

### 型エクスポート

```typescript
export type Xxx = z.infer<typeof XxxSchema>
// discriminatedUnion からの型抽出
export type XxxDatum = Extract<Catalog['data'][number], { type: 'xxx' }>
```

## チェックリスト

- [ ] `z` は `@hono/zod-openapi` からインポート
- [ ] 必須フィールドと任意フィールドを正確に区別
- [ ] 型エクスポートを追加（必要な場合）
- [ ] `bun run build` でビルドエラーがないことを確認

## 共通ルール

- CLI コマンドは `npx` ではなく `bunx` を使う
- 日付操作は `new Date()` ではなく `dayjs` を使う (`z.coerce.date()` は Zod 内部処理なので OK)