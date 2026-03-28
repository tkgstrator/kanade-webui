# スキル: フロントエンドルート追加

TanStack Router のファイルベースルートを追加する手順。

## 手順

### 1. ルートファイル作成

`src/app/routes/` 配下にファイルを作成する。

- 静的ルート: `src/app/routes/xxx.tsx` → `/xxx`
- 動的ルート: `src/app/routes/xxx/$id.tsx` → `/xxx/$id`

```typescript
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/xxx/$id')({
  component: XxxPage,
  // ローダー (任意)
  loader: async ({ params }) => {
    return { id: params.id }
  },
})

function XxxPage() {
  const { id } = Route.useParams()
  return <div>{id}</div>
}
```

### 2. データフェッチ (TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query'
import { client } from '@/lib/client'

const { data, isLoading } = useQuery({
  queryFn: () => client.getXxx({ params: { id: Number(id) } }),
  queryKey: ['xxx', id],
})
```

### 3. ルートツリー更新

`bun run dev` を起動するか、TanStack Router の型生成コマンドを実行すると `src/app/routeTree.gen.ts` が自動更新される。手動編集は不要。

## 規約

- ページコンポーネントはファイル末尾に定義（`Route` の後）
- ローディング中は Skeleton コンポーネントを使う (`src/components/xxx/xxx-skeleton.tsx`)
- エラー状態は適切にハンドリングする
- 日本語 UI テキストを使う
- CLI コマンドは `npx` ではなく `bunx` を使う
- 日付操作は `new Date()` ではなく `dayjs` を使う
