import { z } from '@hono/zod-openapi'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { SearchResults } from '@/components/search-results'

export const Route = createFileRoute('/search/')({
  component: Page,
  validateSearch: zodValidator(
    z.object({
      term: z.string().nonempty(),
    }),
  ),
})

function Page() {
  const { term } = Route.useSearch()
  console.log('[Search] page', { term })
  return <SearchResults term={term} />
}
