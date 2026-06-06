import type { ErrorComponentProps } from '@tanstack/react-router'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function RouteError({ error, reset }: Pick<ErrorComponentProps, 'error' | 'reset'>) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertCircle className="size-12 text-destructive" />
      <h2 className="text-xl font-bold text-foreground">エラーが発生しました</h2>
      <pre className="max-w-lg overflow-auto rounded-lg bg-muted p-4 text-left text-sm text-muted-foreground">
        {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
      </pre>
      <button
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        onClick={reset}
        type="button"
      >
        <RefreshCw className="size-4" />
        再試行
      </button>
    </div>
  )
}
