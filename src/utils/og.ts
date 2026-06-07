import type { ZodiosInstance } from '@zodios/core'
import { getArtworkUrl } from '@/lib/utils'
import type { ZodiosDefinition } from './client'

const BOT_UA_PATTERN =
  /Twitterbot|facebookexternalhit|Facebot|Discordbot|Slackbot|LinkedInBot|TelegramBot|WhatsApp|Embedly|Bingbot|Googlebot|Applebot|Pinterestbot|redditbot|SkypeUriPreview|vkShare|W3C_Validator/i

export const isCrawler = (userAgent: string | null): boolean => {
  if (!userAgent) {
    return false
  }
  return BOT_UA_PATTERN.test(userAgent)
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

type OgMusic = {
  type: 'music.album' | 'music.song' | 'music.musician' | 'website'
  audioUrl?: string
  audioType?: string
  durationSeconds?: number
  albumTitle?: string
  musicianName?: string
  songTitles?: string[]
}

type OgPayload = {
  title: string
  description: string
  image: string
  imageAlt: string
  url: string
  music?: OgMusic
}

const renderOgHtml = (payload: OgPayload): string => {
  const { title, description, image, imageAlt, url, music } = payload
  const t = escapeHtml(title)
  const d = escapeHtml(description)
  const img = escapeHtml(image)
  const alt = escapeHtml(imageAlt)
  const u = escapeHtml(url)
  const ogType = music ? music.type : 'website'
  const musicTags: string[] = []
  if (music) {
    if (music.audioUrl) {
      musicTags.push(`<meta property="og:audio" content="${escapeHtml(music.audioUrl)}">`)
      if (music.audioType) {
        musicTags.push(`<meta property="og:audio:type" content="${escapeHtml(music.audioType)}">`)
      }
    }
    if (music.durationSeconds && music.durationSeconds > 0) {
      musicTags.push(`<meta property="music:duration" content="${music.durationSeconds}">`)
    }
    if (music.albumTitle) {
      musicTags.push(`<meta property="music:album" content="${escapeHtml(music.albumTitle)}">`)
    }
    if (music.musicianName) {
      musicTags.push(`<meta property="music:musician" content="${escapeHtml(music.musicianName)}">`)
    }
    if (music.songTitles) {
      music.songTitles.forEach((song, index) => {
        musicTags.push(`<meta property="music:song" content="${escapeHtml(song)}">`)
        musicTags.push(`<meta property="music:song:track" content="${index + 1}">`)
      })
    }
  }
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<title>${t}</title>
<meta name="description" content="${d}">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Kanade">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:url" content="${u}">
<meta property="og:image" content="${img}">
<meta property="og:image:alt" content="${alt}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="1200">
<meta property="og:locale" content="ja">
${musicTags.join('\n')}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${img}">
<meta name="twitter:image:alt" content="${alt}">
</head>
<body><p>${t}</p></body>
</html>`
}

const SITE_ORIGIN = 'https://music.tkgstrator.work'

const canonicalUrl = (request: Request, fallbackPath: string): string => {
  const url = new URL(request.url)
  if (url.hostname === 'localhost' || url.hostname.endsWith('.workers.dev')) {
    return `${SITE_ORIGIN}${fallbackPath}`
  }
  return `${url.origin}${fallbackPath}`
}

export const renderAlbumOg = async (
  client: ZodiosInstance<ZodiosDefinition>,
  id: number,
  request: Request,
): Promise<string | null> => {
  const response = await client.get('/v1/catalog/:storefront/albums/:id', {
    params: { id, storefront: 'jp' },
  })
  const album = response.data[0]
  if (album?.type !== 'albums') {
    return null
  }
  const { artistName, artwork, isSingle, name, recordLabel, trackCount, releaseDate } = album.attributes
  const description = `${artistName} • ${trackCount}曲 • ${releaseDate}${recordLabel ? ` • ${recordLabel}` : ''}`
  const tracks = album.relationships?.tracks?.data ?? []
  const songs = tracks.flatMap((track) => (track.type === 'songs' ? [track] : []))
  const leadSong = songs[0]
  const leadPreview = leadSong?.attributes.previews?.[0]?.url
  const leadDuration = leadSong?.attributes.durationInMillis
  const ogType: OgMusic['type'] = isSingle || songs.length === 1 ? 'music.song' : 'music.album'
  return renderOgHtml({
    description,
    image: getArtworkUrl(artwork.url, 1200),
    imageAlt: `${name} - ${artistName}`,
    music: {
      albumTitle: name,
      audioType: leadPreview ? 'audio/mp4' : undefined,
      audioUrl: leadPreview,
      durationSeconds: leadDuration ? Math.round(leadDuration / 1000) : undefined,
      musicianName: artistName,
      songTitles: ogType === 'music.album' ? songs.map((song) => song.attributes.name).slice(0, 50) : undefined,
      type: ogType,
    },
    title: `${name} - ${artistName} | Kanade`,
    url: canonicalUrl(request, `/albums/${id}`),
  })
}

export const renderArtistOg = async (
  client: ZodiosInstance<ZodiosDefinition>,
  id: number,
  request: Request,
): Promise<string | null> => {
  const response = await client.get('/v1/catalog/:storefront/artists/:id', {
    params: { id, storefront: 'jp' },
    queries: { include: ['albums'] },
  })
  const artist = response.data[0]
  if (artist?.type !== 'artists') {
    return null
  }
  const { artwork, genreNames, name } = artist.attributes
  const image = artwork ? getArtworkUrl(artwork.url, 1200) : `${SITE_ORIGIN}/assets/meta/music-kit.png`
  const description = genreNames.length > 0 ? `${name} • ${genreNames.join(', ')}` : name
  return renderOgHtml({
    description,
    image,
    imageAlt: name,
    music: {
      musicianName: name,
      type: 'music.musician',
    },
    title: `${name} | Kanade`,
    url: canonicalUrl(request, `/artists/${id}`),
  })
}
