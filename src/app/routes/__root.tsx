import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { MusicSidebar } from "@/components/music-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export const Route = createRootRoute({
  component: () => (
    <SidebarProvider>
      <MusicSidebar />
      <div className="min-h-screen flex flex-col w-full">
        <main className="flex-1">
          <Outlet />
        </main>
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </SidebarProvider>
  ),
})
