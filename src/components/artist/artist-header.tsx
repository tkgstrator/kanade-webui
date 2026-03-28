import { getArtworkUrl } from '@/lib/utils'
import type { CatalogArtistDatum } from '@/schemas/common.dto'

export function ArtistHeader({ artist }: { artist: CatalogArtistDatum }) {
  const { attributes } = artist

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          alt={attributes.name}
          className="h-full w-full scale-110 object-cover opacity-40 blur-2xl"
          draggable={false}
          src={getArtworkUrl(attributes.artwork?.url ?? '', 800)}
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/50 to-background" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 pt-8 md:flex-row md:items-end md:gap-8 md:px-8 md:pt-12">
        <img
          alt={attributes.name}
          className="size-40 rounded-full object-cover shadow-2xl ring-4 ring-background/50"
          draggable={false}
          src={getArtworkUrl(attributes.artwork?.url ?? '', 400)}
        />
        <div className="flex flex-col items-center gap-3 md:items-start md:pb-2">
          <h1 className="text-3xl font-bold text-foreground">{attributes.name}</h1>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {attributes.genreNames.slice(0, 3).map((genre: string) => (
              <span
                className="rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                key={genre}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
