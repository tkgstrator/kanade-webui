import { createFileRoute } from "@tanstack/react-router"
import { SearchResults } from "@/components/search-results"

export const Route = createFileRoute("/")({
  component: Page,
})

function Page() {
  return <></>
}
