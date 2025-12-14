'use client'

import { useMutation } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/ja'
import { Download, Shuffle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { type CatalogAlbumDatum, client } from '@/lib/client'

dayjs.extend(localizedFormat)
dayjs.locale('ja')

function getArtworkUrl(url: string, size: number): string {
  return url.replace('{w}', size.toString()).replace('{h}', size.toString())
}

export function AlbumHeader({ album }: { album: CatalogAlbumDatum }) {
  const { attributes, relationships } = album

  const { mutate } = useMutation({
    mutationFn: async () =>
      client.post('/api/queues', {
        album_id: Number(album.id),
      }),
    mutationKey: ['queues', album.id],
    onError: (error) => {
      console.error(error)
      toast.error('キューへの追加に失敗しました')
    },
    onSuccess: () => {
      toast.success('キューに追加されました')
    },
  })

  return (
    <div className="flex flex-col gap-8 pb-8 select-none">
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 pt-8 lg:flex-row lg:items-end lg:gap-8 lg:px-8 lg:pt-12">
        <img
          alt={attributes.name}
          className="aspect-square w-full max-w-67.5 rounded-lg object-cover shadow-lg"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 600)}
        />
        <div className="flex flex-col items-center lg:items-start lg:justify-between lg:h-67.5">
          <div />
          <div className="flex flex-col items-center lg:items-start">
            <h1 className="text-3xl text-foreground text-center lg:text-left font-semibold">{attributes.name}</h1>
            <Link
              className="font-medium text-foreground hover:underline text-2xl"
              params={{ artist_id: Number(relationships?.artists?.data?.[0]?.id) }}
              to="/artists/$artist_id"
            >
              {attributes.artistName}
            </Link>
            <span className="text-sm text-muted-foreground">{dayjs(attributes.releaseDate).format('LL')}</span>
          </div>
          <div className="flex gap-4 mt-4 lg:mt-0">
            <Button
              className="bg-red-600 hover:bg-red-700 text-white px-4 h-7 w-31.75 text-sm rounded-sm gap-2"
              onClick={() => mutate()}
            >
              <Download className="size-4" />
              ダウンロード
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-4 h-7 w-31.75 text-sm rounded-sm gap-2">
              <Shuffle className="size-4" />
              シャッフル
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
