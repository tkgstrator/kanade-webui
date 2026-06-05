import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import { Download } from 'lucide-react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { client } from '@/lib/client'
import { getArtworkUrl } from '@/lib/utils'
import type { CatalogArtistDatum } from '@/schemas/common.dto'

dayjs.extend(localizedFormat)
dayjs.locale('ja')

type AlbumRelationDatum = NonNullable<NonNullable<CatalogArtistDatum['relationships']>['albums']>['data'][number]

function DownloadButton({ albumId }: { albumId: number }) {
  const { mutate, isPending } = useMutation({
    mutationFn: async () =>
      client.post('/api/queues', {
        album_id: albumId,
      }),
    mutationKey: ['queues', String(albumId)],
    onError: (error) => {
      console.error('[Queue] error', { albumId, error })
      toast.error('キューへの追加に失敗しました')
    },
    onMutate: () => {
      console.log('[Queue] adding album', { albumId })
    },
    onSuccess: () => {
      console.log('[Queue] success', { albumId })
      toast.success('キューに追加されました')
    },
  })

  return (
    <Button
      className="absolute right-2 bottom-2 size-8 rounded-full bg-black/60 p-0 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/80 group-hover:opacity-100"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        mutate()
      }}
      size="icon"
    >
      <Download className="size-4" />
    </Button>
  )
}

function AlbumCard({ album }: { album: AlbumRelationDatum }) {
  if (album.type !== 'albums') return null
  const { attributes } = album

  return (
    <Link className="group flex flex-col gap-2" params={{ album_id: Number(album.id) }} to="/albums/$album_id">
      <motion.div
        className="relative overflow-hidden rounded-lg shadow-md"
        transition={{ damping: 20, stiffness: 300, type: 'spring' }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <img
          alt={attributes.name}
          className="aspect-square w-full object-cover"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 400)}
        />
        <DownloadButton albumId={Number(album.id)} />
      </motion.div>
      <div className="flex flex-col px-1">
        <span className="truncate text-sm font-medium text-foreground group-hover:underline">{attributes.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {dayjs(attributes.releaseDate).format('YYYY')} · {attributes.isSingle ? 'シングル' : 'アルバム'}
        </span>
      </div>
    </Link>
  )
}

export function AlbumSection({ title, albums }: { title: string; albums: AlbumRelationDatum[] }) {
  if (albums.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="px-6 text-xl font-bold text-foreground md:px-8">{title}</h2>
      <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 md:grid-cols-4 md:px-8 lg:grid-cols-5 xl:grid-cols-6">
        {albums.map((album, index) => (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="max-w-55"
            initial={{ opacity: 0, y: 20 }}
            key={album.id}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <AlbumCard album={album} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
