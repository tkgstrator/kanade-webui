'use client'

import { Link } from '@tanstack/react-router'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/ja'

dayjs.extend(localizedFormat)
dayjs.locale('ja')

type Album = {
  id?: string | number
  attributes?: {
    name: string
    artwork: {
      url: string
    }
    artistName: string
    releaseDate: string | null
    isSingle?: boolean
  }
}

function getArtworkUrl(url: string, size: number): string {
  return url.replace('{w}', size.toString()).replace('{h}', size.toString())
}

function AlbumCard({ album }: { album: Album }) {
  const { attributes } = album

  if (!attributes) return null

  return (
    <Link className="group flex flex-col gap-2" params={{ album_id: Number(album.id) }} to="/albums/$album_id">
      <div className="relative overflow-hidden rounded-lg shadow-md transition-transform duration-200 group-hover:scale-[1.02]">
        <img
          alt={attributes.name}
          className="aspect-square w-full object-cover"
          draggable={false}
          src={getArtworkUrl(attributes.artwork.url, 400)}
        />
      </div>
      <div className="flex flex-col px-1">
        <span className="truncate text-sm font-medium text-foreground group-hover:underline">{attributes.name}</span>
        <span className="truncate text-xs text-muted-foreground">
          {dayjs(attributes.releaseDate).format('YYYY')} · {attributes.isSingle ? 'シングル' : 'アルバム'}
        </span>
      </div>
    </Link>
  )
}

export function AlbumSection({ title, albums }: { title: string; albums: Album[] }) {
  if (albums.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-bold text-foreground px-6 md:px-8">{title}</h2>
      <div className="grid grid-cols-2 gap-4 px-6 sm:grid-cols-3 md:grid-cols-4 md:px-8 lg:grid-cols-5 xl:grid-cols-6">
        {albums.map((album) => (
          <div className="max-w-55" key={album.id}>
            <AlbumCard album={album} />
          </div>
        ))}
      </div>
    </section>
  )
}
