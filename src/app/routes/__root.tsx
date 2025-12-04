import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Header } from "@/components/header"
import { MusicSidebar } from "@/components/music-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

export const Route = createRootRoute({
  component: () => (
    <SidebarProvider>
      <MusicSidebar />
      <div className="min-h-screen flex flex-col w-full">
        <Header />
        <main className="flex-1 pt-12 md:pt-0">
          <Outlet />
        </main>
        <TanStackRouterDevtools position="bottom-right" />
      </div>
    </SidebarProvider>
  ),
})
