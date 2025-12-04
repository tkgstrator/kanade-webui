import { createFileRoute } from "@tanstack/react-router"
import { zodValidator } from "@tanstack/zod-adapter"
import { z } from "zod"
import { SearchResults } from "@/components/search-results"

export const Route = createFileRoute("/search/")({
  component: Page,
  validateSearch: zodValidator(
    z.object({
      term: z.string().nonempty(),
    }),
  ),
})

function Page() {
  const search = Route.useSearch()
  return <SearchResults term={search.term} />
}
