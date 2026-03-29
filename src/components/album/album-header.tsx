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
import type { CatalogAlbumDatum } from '@/schemas/common.dto'

dayjs.extend(localizedFormat)
dayjs.locale('ja')

export function AlbumHeader({ album }: { album: CatalogAlbumDatum }) {
  const { attributes, relationships } = album

  const { mutate } = useMutation({
    mutationFn: async () =>
      client.post('/api/queues', {
        album_id: Number(album.id),
      }),
    mutationKey: ['queues', album.id],
    onError: (error) => {
      console.error('[Queue] error', { albumId: album.id, error })
      toast.error('キューへの追加に失敗しました')
    },
    onMutate: () => {
      console.log('[Queue] adding album', { albumId: album.id, name: attributes.name })
    },
    onSuccess: () => {
      console.log('[Queue] success', { albumId: album.id })
      toast.success('キューに追加されました')
    },
  })

  return (
    <div className="flex flex-col gap-8 pb-8 select-none">
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 pt-8 lg:flex-row lg:items-end lg:gap-8 lg:px-8 lg:pt-12">
        <motion.img
          alt={attributes.name}
          className="aspect-square w-full max-w-67.5 rounded-lg object-cover shadow-lg"
          draggable={false}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          src={getArtworkUrl(attributes.artwork.url, 600)}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <motion.div
          className="flex flex-col items-center lg:h-67.5 lg:items-start lg:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div />
          <div className="flex flex-col items-center lg:items-start">
            <h1 className="text-center text-3xl font-semibold text-foreground lg:text-left">{attributes.name}</h1>
            <Link
              className="text-2xl font-medium text-foreground hover:underline"
              params={{ artist_id: Number(relationships?.artists?.data?.[0]?.id) }}
              to="/artists/$artist_id"
            >
              {attributes.artistName}
            </Link>
            <span className="text-sm text-muted-foreground">{dayjs(attributes.releaseDate).format('LL')}</span>
          </div>
          <motion.div
            className="mt-4 flex gap-4 lg:mt-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Button
              className="h-7 w-31.75 gap-2 rounded-sm bg-red-600 px-4 text-sm text-white hover:bg-red-700"
              onClick={() => mutate()}
            >
              <Download className="size-4" />
              ダウンロード
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
