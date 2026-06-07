import { useMutation } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { client } from '@/lib/client'
import { getArtworkUrl } from '@/lib/utils'
import type { CatalogArtistDatum } from '@/schemas/common.dto'

type AlbumRelationDatum = NonNullable<NonNullable<CatalogArtistDatum['relationships']>['albums']>['data'][number]
type AlbumDatum = Extract<AlbumRelationDatum, { type: 'albums' }>

export function ArtistDownloadDialog({ albums }: { albums: AlbumRelationDatum[] }) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const albumItems = useMemo(() => albums.filter((album): album is AlbumDatum => album.type === 'albums'), [albums])

  const sortedAlbums = useMemo(
    () =>
      [...albumItems].sort((a, b) => {
        const aDate = a.attributes.releaseDate ?? ''
        const bDate = b.attributes.releaseDate ?? ''
        return bDate.localeCompare(aDate)
      }),
    [albumItems],
  )

  const allSelected = sortedAlbums.length > 0 && selectedIds.size === sortedAlbums.length

  const { mutate, isPending } = useMutation({
    mutationFn: async (albumIds: number[]) => {
      const results = await Promise.allSettled(
        albumIds.map((album_id) =>
          client.post('/api/queues', {
            album_id,
            options: { overwrite: false },
          }),
        ),
      )
      const failed = results.filter((r) => r.status === 'rejected').length
      return { failed, total: albumIds.length }
    },
    mutationKey: ['queues', 'artist-download'],
    onError: (error) => {
      console.error('[Queue] error', { error })
      toast.error('キューへの追加に失敗しました')
    },
    onSuccess: ({ failed, total }) => {
      if (failed === 0) {
        toast.success(`${total} 件のアルバムをキューに追加しました`)
      } else if (failed === total) {
        toast.error('キューへの追加に失敗しました')
        return
      } else {
        toast.warning(`${total - failed} / ${total} 件をキューに追加しました`)
      }
      setOpen(false)
      setSelectedIds(new Set())
    },
  })

  const toggleAlbum = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sortedAlbums.map((album) => album.id)))
    }
  }

  const handleDownload = () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return
    mutate(ids)
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          className="mt-1 h-7 gap-2 rounded-sm bg-red-600 px-4 text-sm text-white hover:bg-red-700"
          disabled={sortedAlbums.length === 0}
        >
          <Download className="size-4" />
          ダウンロード
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] flex-col gap-4 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>ダウンロードするアルバムを選択</DialogTitle>
          <DialogDescription>キューに追加したいアルバムを選択してください ({sortedAlbums.length} 件)</DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between border-b pb-2">
          <button
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            onClick={toggleAll}
            type="button"
          >
            <Checkbox checked={allSelected} tabIndex={-1} />
            すべて選択
          </button>
          <span className="text-xs text-muted-foreground">{selectedIds.size} 件選択中</span>
        </div>
        <ul className="flex flex-col gap-1 overflow-y-auto">
          {sortedAlbums.map((album) => {
            const checked = selectedIds.has(album.id)
            return (
              <li key={album.id}>
                <button
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-muted/60"
                  onClick={() => toggleAlbum(album.id)}
                  type="button"
                >
                  <Checkbox checked={checked} tabIndex={-1} />
                  <img
                    alt={album.attributes.name}
                    className="size-10 shrink-0 rounded object-cover"
                    draggable={false}
                    src={getArtworkUrl(album.attributes.artwork.url, 100)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{album.attributes.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {dayjs(album.attributes.releaseDate).format('YYYY')} ·{' '}
                      {album.attributes.isSingle ? 'シングル' : 'アルバム'}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            キャンセル
          </Button>
          <Button
            className="gap-2 bg-red-600 text-white hover:bg-red-700"
            disabled={selectedIds.size === 0 || isPending}
            onClick={handleDownload}
          >
            <Download className="size-4" />
            ダウンロード
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
