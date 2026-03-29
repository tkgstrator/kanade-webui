/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

// ナビゲーションリクエスト（HTML）はネットワークファーストにする
// デプロイ後すぐに最新の HTML を取得できるようにする
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'navigations',
      networkTimeoutSeconds: 3,
    }),
  ),
)
