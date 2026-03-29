# CLAUDE.md

## プロジェクト概要

Apple Music カタログブラウザアプリ。
- **バックエンド**: Hono on Cloudflare Workers (src/index.ts)
- **フロントエンド**: React 19 + TanStack Router (src/app/)
- **API クライアント**: Zodios + Zod スキーマ (src/utils/client.ts)
- **デプロイ**: Cloudflare Workers (wrangler.toml)
- **パッケージマネージャ**: Bun

## 開発コマンド

```bash
bun run dev        # Vite 開発サーバー起動 (port 15175)
bun run build      # TypeScript + Vite プロダクションビルド
bun run deploy     # Cloudflare Workers へデプロイ
bun run generate   # OpenAPI スキーマから Zodios クライアント生成
```

## コーディング規約

### フォーマット (Biome)
- インデント: スペース 2 つ
- クォート: シングルクォート (`'`)
- セミコロン: 不要 (`asNeeded`)
- 行幅: 120 文字
- インポート: 自動整列 (Biome assist)

### TypeScript
- `strict: true` + `strictNullChecks: true`
- `noUnusedLocals` / `noUnusedParameters` で未使用変数禁止
- `verbatimModuleSyntax`: 型インポートは `import type` を使う
- パスエイリアス: `@/*` → `src/*`
- **型定義は独自に `type` / `interface` を書かず、Zod スキーマから `z.infer<>` で導出する**
- **`as` による型アサーションは禁止。`tsc` を通すためだけの `as` は使わない**
  - 型エラーが出る場合はスキーマ定義やロジックを修正して型安全に解決する
  - `as const` は許可

### Zod スキーマ
- スキーマは `src/schemas/common.dto.ts` に集約
- 新しいエンドポイントを追加するときは必ずここにスキーマを定義してから実装する
- `@hono/zod-openapi` の `z` を使う (標準の `zod` ではなく)

### Hono API
- エンドポイントは `OpenAPIHono` + `createRoute` で定義する
- バリデーション済みデータは `c.req.valid('query')` / `c.req.valid('param')` / `c.req.valid('json')` で取得する
- エラーは `HTTPException` を throw する

### React / フロントエンド
- ルートは `src/app/routes/` 配下にファイルベースで作成 (TanStack Router)
- `routeTree.gen.ts` は自動生成なので編集しない
- `src/components/ui/` 配下の UI プリミティブは Biome 対象外
- 日本語 UI テキストを使う (検索、アルバム、アーティスト 等)
- タイムゾーン: Asia/Tokyo (dayjs)

## ディレクトリ構成

```
src/
├── index.ts              # Hono サーバーエントリポイント (API ルート定義)
├── schemas/
│   ├── common.dto.ts     # 共通 Zod スキーマ・DTO 定義
│   └── queue.dto.ts      # キュー関連スキーマ
├── utils/
│   ├── client.ts         # Apple Music API Zodios クライアント定義
│   └── binding.ts        # Cloudflare Workers Env 型定義
├── lib/
│   ├── client.ts         # 自動生成クライアント (編集しない)
│   ├── token.ts          # JWT トークン管理
│   └── utils.ts          # ユーティリティ関数
├── app/
│   ├── main.tsx          # React エントリポイント
│   ├── routes/           # ファイルベースルート (TanStack Router)
│   └── routeTree.gen.ts  # 自動生成 (編集しない)
├── components/
│   ├── ui/               # UI プリミティブ (編集対象外)
│   ├── artist/           # アーティスト関連コンポーネント
│   ├── album/            # アルバム関連コンポーネント
│   └── ...
└── hooks/                # カスタム React フック
```

## API エンドポイント

| Method | Path | 説明 |
|--------|------|------|
| GET | /api/version | アプリバージョン情報 (version, hash, buildAt) |
| GET | /api/search | Apple Music カタログ検索 (`?term=`) |
| GET | /api/albums/:id | アルバム詳細 |
| GET | /api/artists/:id | アーティスト詳細 (albums を include) |
| POST | /api/queues | キュー作成 (PROXY_URL 経由) |

## 環境変数 (.dev.vars)

```
APPLE_MUSIC_TEAM_ID        # Apple Developer Team ID
APPLE_MUSIC_KEY_ID         # Apple Music API Key ID
APPLE_MUSIC_PRIVATE_KEY    # Base64 エンコード済み秘密鍵
CF_ACCESS_CLIENT_ID        # Cloudflare Access クライアント ID
CF_ACCESS_CLIENT_SECRET    # Cloudflare Access クライアントシークレット
PROXY_URL                  # バックエンドプロキシ URL
```

## デプロイ環境

- **prod**: `music.tkgstrator.work` (Cloudflare Workers `env.prod`)
- **dev**: `music-dev.tkgstrator.work` (Cloudflare Workers `env.dev`)
- デプロイコマンド: `wrangler deploy --env prod`

<!-- ## エージェントチーム

コードの実装・改修タスクを受けた場合は、常に `orchestrator` エージェント (Agent Teams) を使って作業を進めること。
直接コードを編集するのではなく、orchestrator にタスクを委譲し、orchestrator が frontend-implementer / backend-implementer / test-runner / doc-updater を適切に呼び出して作業を完了させる。

- **対象**: 機能追加、バグ修正、リファクタリングなど、コード変更を伴うすべてのタスク
- **例外**: 単純な質問への回答、コードの説明、CLAUDE.md 自体の編集など、コード変更を伴わないタスクは直接対応して良い -->

## PWA バージョン管理と更新システム

### ビルド時定数

`vite.config.ts` の `define` で以下の値がビルド時に埋め込まれる:

| 定数 | 内容 | ソース |
|------|------|--------|
| `__APP_VERSION__` | パッケージバージョン | `package.json` の `version` |
| `__GIT_HASH__` | Git コミットハッシュ (短縮) | `git rev-parse --short HEAD` |
| `__BUILD_AT__` | ビルド日時 (ISO 8601) | ビルド実行時の `new Date().toISOString()` |

これらはフロントエンド・バックエンド両方で参照可能。型定義は `src/env.d.ts` にある。

### Service Worker (PWA)

- **戦略**: `injectManifest` (Workbox) + 手動登録 (`injectRegister: false`)
- **キャッシュ**: 静的アセットは `precacheAndRoute` でプリキャッシュ、ナビゲーションリクエスト (HTML) は `NetworkFirst` (3 秒タイムアウト)
- **即時反映**: `skipWaiting()` + `clientsClaim()` で新しい SW が即座にアクティブ化
- **更新チェック**: `useServiceWorker` フック (`src/hooks/use-service-worker.ts`) が 5 分間隔で `registration.update()` を呼ぶ
- **自動リロード**: SW の `controllerchange` イベント検知で `window.location.reload()`

### API バージョンチェック

SW のキャッシュ更新に依存しない確実な更新検知として、`GET /api/version` を利用する。

- **エンドポイント**: `GET /api/version` → `{ version, hash, buildAt }` (トークン認証不要)
- **チェックタイミング**: トップページ (`/`) アクセス時のみ (`useVersionCheck` フック)
- **比較方法**: `localStorage` (`app-version-hash`) に前回のハッシュを保存し、サーバーのハッシュと比較
- **通知**: ハッシュ不一致時にトースト通知で「今すぐ更新」ボタンを表示
- **初回アクセス**: ストレージに保存するだけで通知しない

```
デプロイ → サーバーの __GIT_HASH__ が更新される
    ↓
ユーザーがトップページにアクセス
    ↓
fetch('/api/version') で最新ハッシュ取得
    ↓
localStorage の保存ハッシュと比較
    ↓
不一致 → トースト通知 → ユーザーが「今すぐ更新」クリック → リロード
```

### 関連ファイル

| ファイル | 役割 |
|---------|------|
| `src/sw.ts` | Service Worker 本体 (precache + NetworkFirst navigation) |
| `src/hooks/use-service-worker.ts` | SW 登録・更新チェック・自動リロード |
| `src/hooks/use-version-check.ts` | API バージョンチェック・トースト通知 |
| `src/schemas/common.dto.ts` | `VersionResponseSchema` 定義 |
| `src/index.ts` | `/api/version` エンドポイント |

## 注意事項

- `src/lib/client.ts` は OpenAPI スキーマから自動生成。手動編集不可
- `src/app/routeTree.gen.ts` は TanStack Router が自動生成。手動編集不可
- Apple Music API のストアフロントは現在 `jp` 固定
- Cloudflare Workers の制約: Node.js API は `nodejs_compat_v2` フラグで一部利用可能
- **`npx` は使わない。必ず `bunx` を使うこと**
- **`new Date()` は使わない。日付操作には必ず `dayjs` を使うこと**

```typescript
// NG
const now = new Date()
const date = new Date('2024-01-01')

// OK
import dayjs from 'dayjs'
const now = dayjs()
const date = dayjs('2024-01-01')
```
