import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { VersionResponseSchema } from '@/schemas/common.dto'

const STORAGE_KEY = 'app-version-hash'

export function useVersionCheck() {
  const toastIdRef = useRef<string | number | undefined>(undefined)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' })
        if (!res.ok) return
        const json = await res.json()
        const data = VersionResponseSchema.parse(json)
        const serverHash = data.hash
        const storedHash = localStorage.getItem(STORAGE_KEY)

        console.debug('[VersionCheck]', { local: __GIT_HASH__, remote: serverHash, stored: storedHash })

        // 初回アクセスまたはローカルと一致: ストレージを更新して終了
        if (!storedHash || storedHash === serverHash) {
          localStorage.setItem(STORAGE_KEY, serverHash)
          return
        }

        // ストレージに保存されたハッシュとサーバーが異なる = 新バージョンがデプロイされた
        if (storedHash !== serverHash) {
          console.log('[VersionCheck] new version detected', { current: storedHash, remote: serverHash })
          localStorage.setItem(STORAGE_KEY, serverHash)

          if (toastIdRef.current) return
          toastIdRef.current = toast('新しいバージョンが利用可能です', {
            action: {
              label: '今すぐ更新',
              onClick: () => window.location.reload(),
            },
            description: `${storedHash} → ${serverHash}`,
            duration: Number.POSITIVE_INFINITY,
            onDismiss: () => {
              toastIdRef.current = undefined
            },
          })
        }
      } catch {
        console.debug('[VersionCheck] fetch failed')
      }
    }

    check()
  }, [])
}
