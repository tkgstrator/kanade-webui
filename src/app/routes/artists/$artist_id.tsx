import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { client } from "@/lib/client"

export const Route = createFileRoute("/artists/$artist_id")({
  component: Page,
  loader: async ({ params }) =>
    client.get("/api/artists/:artist_id", {
      params: {
        artist_id: params.artist_id,
      },
    }),
  params: {
    parse: (params) =>
      z
        .object({
          artist_id: z.coerce.number().int().positive(),
        })
        .parse(params),
    stringify: (params) => ({ artist_id: String(params.artist_id) }),
  },
})

function Page() {
  return <div>Hello "/artists/$artist_id"!</div>
}
