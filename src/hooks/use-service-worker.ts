import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

export function useServiceWorker() {
  const { updateServiceWorker } = useRegisterSW({
    onNeedRefresh() {
      console.log('[SW] new version available, auto-updating')
      toast('新しいバージョンに更新中...', {
        description: 'まもなく自動的に反映されます。',
        duration: 5000,
      })
      updateServiceWorker()
    },
    onOfflineReady() {
      console.log('[SW] offline ready')
      toast('オフライン対応完了', {
        description: 'アプリをオフラインで利用できます。',
        duration: 3000,
      })
    },
    onRegisteredSW(swUrl, registration) {
      console.log('[SW] registered', { swUrl })
      if (!registration) return
      setInterval(() => {
        console.debug('[SW] checking for updates')
        registration.update()
      }, 1000 * 60 * 5)
    },
  })

  useEffect(() => {
    const onControllerChange = () => {
      console.log('[SW] controller changed, reloading')
      window.location.reload()
    }
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange)
    return () => {
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])
}
