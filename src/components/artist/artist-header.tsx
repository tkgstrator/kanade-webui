import { UserRound } from 'lucide-react'
import { motion } from 'motion/react'
import { getArtworkUrl } from '@/lib/utils'
import type { CatalogArtistDatum } from '@/schemas/common.dto'
import { ArtistDownloadDialog } from './artist-download-dialog'

type AlbumRelationDatum = NonNullable<NonNullable<CatalogArtistDatum['relationships']>['albums']>['data'][number]

export function ArtistHeader({ artist, albums }: { artist: CatalogArtistDatum; albums: AlbumRelationDatum[] }) {
  const { attributes } = artist
  const artworkUrl = attributes.artwork ? attributes.artwork.url : undefined

  return (
    <div className="relative w-full">
      <div className="absolute inset-0 z-0 overflow-hidden">
        {artworkUrl ? (
          <img
            alt={attributes.name}
            className="h-full w-full scale-110 object-cover opacity-40 blur-2xl"
            draggable={false}
            src={getArtworkUrl(artworkUrl, 800)}
          />
        ) : (
          <div className="h-full w-full bg-linear-to-br from-muted/40 via-muted/20 to-background" />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/50 to-background" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 pt-8 md:flex-row md:items-end md:gap-8 md:px-8 md:pt-12">
        {artworkUrl ? (
          <motion.img
            alt={attributes.name}
            animate={{ opacity: 1, scale: 1 }}
            className="size-40 rounded-full object-cover shadow-2xl ring-4 ring-background/50"
            draggable={false}
            initial={{ opacity: 0, scale: 0.8 }}
            src={getArtworkUrl(artworkUrl, 400)}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        ) : (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            aria-label={attributes.name}
            className="flex size-40 items-center justify-center rounded-full bg-muted shadow-2xl ring-4 ring-background/50"
            initial={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <UserRound className="size-20 text-muted-foreground" strokeWidth={1.5} />
          </motion.div>
        )}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 md:items-start md:pb-2"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">{attributes.name}</h1>
          <div className="flex flex-wrap justify-center gap-2 md:justify-start">
            {attributes.genreNames.slice(0, 3).map((genre: string, index: number) => (
              <motion.span
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-full bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.8 }}
                key={genre}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
              >
                {genre}
              </motion.span>
            ))}
          </div>
          <ArtistDownloadDialog albums={albums} />
        </motion.div>
      </div>
    </div>
  )
}
