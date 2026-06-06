import { Link } from '@tanstack/react-router'
import { Home, SearchX } from 'lucide-react'

export function RouteNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <SearchX className="size-12 text-muted-foreground" />
      <h2 className="text-2xl font-bold text-foreground">ページが見つかりません</h2>
      <p className="max-w-md text-sm text-muted-foreground">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link
        className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        to="/"
      >
        <Home className="size-4" />
        ホームに戻る
      </Link>
    </div>
  )
}
