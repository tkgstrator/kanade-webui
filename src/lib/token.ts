import dayjs from 'dayjs'
import { decodeJwt, importPKCS8, SignJWT } from 'jose'

// トークンの有効期限切れかどうか判定
export function isTokenExpired(token: string): boolean {
  const { exp } = decodeJwt(token)
  if (!exp) return true
  return dayjs().isAfter(dayjs.unix(exp))
}

import type { Env } from '../utils/binding'

export const signToken = async (env: Env['Bindings']): Promise<string> => {
  const PRIVATE_KEY = await importPKCS8(atob(env.APPLE_MUSIC_PRIVATE_KEY), 'ES256')

  return new SignJWT({})
    .setProtectedHeader({
      alg: 'ES256',
      kid: env.APPLE_MUSIC_KEY_ID,
    })
    .setIssuer(env.APPLE_MUSIC_TEAM_ID)
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(PRIVATE_KEY)
}
