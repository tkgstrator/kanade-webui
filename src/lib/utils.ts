import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getArtworkUrl(url: string, size: number): string {
  return url.replace('{w}', size.toString()).replace('{h}', size.toString())
}

export function extractAlbumIdFromUrl(url: string): number {
  const segments = new URL(url).pathname.split('/').filter(Boolean)
  const last = segments.at(-1)
  if (last === undefined) {
    throw new Error(`cannot extract album id from url: ${url}`)
  }
  const id = Number.parseInt(last, 10)
  if (Number.isNaN(id)) {
    throw new Error(`album id is not numeric in url: ${url}`)
  }
  return id
}
