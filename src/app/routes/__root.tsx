import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import { Header } from "@/components/header"
import { MusicSidebar } from "@/components/music-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export const Route = createRootRoute({
  component: () => (
    <SidebarProvider>
      <MusicSidebar />
      <Header />
      <SidebarInset>
        <main>
          <Outlet />
        </main>
      </SidebarInset>
      <TanStackRouterDevtools position="bottom-right" />
    </SidebarProvider>
  ),
})
