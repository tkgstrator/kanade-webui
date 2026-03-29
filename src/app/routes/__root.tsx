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
        <div className="pt-12 pb-20 md:pt-0">
          <Outlet />
        </div>
      </SidebarInset>
      <MiniPlayer />
    </SidebarProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
