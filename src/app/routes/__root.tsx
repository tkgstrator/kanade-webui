import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Header } from '@/components/header'
import { MiniPlayer } from '@/components/mini-player'
import { MusicSidebar } from '@/components/music-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useServiceWorker } from '@/hooks/use-service-worker'

function RootComponent() {
  useServiceWorker()

  return (
    <SidebarProvider>
      <MusicSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <Header />
        <div className="pt-12 md:pt-0">
          <Outlet />
          <footer className="px-6 py-4 text-center text-xs text-muted-foreground">
            <p>v{__APP_VERSION__} ({__GIT_HASH__})</p>
            <p>&copy;2026 NEVER KNOWS BEST</p>
          </footer>
        </div>
      </SidebarInset>
      <MiniPlayer />
    </SidebarProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
