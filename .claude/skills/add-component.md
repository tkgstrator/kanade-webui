# スキル: React コンポーネント追加

新しい React コンポーネントを追加する手順。

## ディレクトリ構成

```
src/components/
├── ui/           # UI プリミティブ (shadcn 由来、編集しない)
├── artist/       # アーティスト関連
├── album/        # アルバム関連
└── <新規ドメイン>/ # 新しいドメインのコンポーネント
```

## コンポーネントの書き方

```typescript
import type { CatalogXxxDatum } from '@/schemas/common.dto'

type Props = {
  data: CatalogXxxDatum
}

export function XxxCard({ data }: Props) {
  return (
    <div>
      <img
        alt={data.attributes.name}
        src={data.attributes.artwork.url
          .replace('{w}', '300')
          .replace('{h}', '300')}
      />
      <p>{data.attributes.name}</p>
    </div>
  )
}
```

## スケルトン (ローディング状態)

```typescript
import { Skeleton } from '@/components/ui/skeleton'

export function XxxSkeleton() {
  return (
    <div>
      <Skeleton className="h-[300px] w-[300px]" />
      <Skeleton className="mt-2 h-4 w-32" />
    </div>
  )
}
```

## アートワーク URL の扱い

Apple Music のアートワーク URL には `{w}` と `{h}` のプレースホルダーが含まれる:

```typescript
const artworkUrl = artwork.url
  .replace('{w}', String(size))
  .replace('{h}', String(size))
```

## 規約

- コンポーネント名は PascalCase
- ファイル名は kebab-case (`artist-header.tsx`)
- `src/components/ui/` は Biome の対象外なので変更しない
- 日本語 UI テキストを使う